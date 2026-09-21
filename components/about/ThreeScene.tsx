"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import type { SceneConfig } from "@/content/config";
import { restingPlace, type SceneObject } from "./sceneTypes";

/**
 * The desk of favourites.
 *
 * three.js for the picture, cannon-es for the weight - the same pair the
 * reference uses. Everything on it is a real object: it can be picked up,
 * thrown, and tapped for whatever that object does.
 *
 * The scene is built once, imperatively, and React never re-renders it. What
 * crosses back into React is only the HTML: the hover card and the pinned one.
 */

/** A scripted move - the flip - during which physics lets go of the body. */
type Tween = {
  start: number;
  duration: number;
  from: CANNON.Quaternion;
  to: CANNON.Quaternion;
  baseY: number;
  lift: number;
};

type Prop = {
  object: SceneObject;
  group: THREE.Group;
  body: CANNON.Body;
  /** How high the object is lifted while it is being dragged. */
  dragHeight: number;
  home: { position: CANNON.Vec3; quaternion: CANNON.Quaternion };
  /** A book's cover, hinged on the spine. */
  lid: THREE.Object3D | null;
  lidTarget: number;
  tween: Tween | null;
};

export type HoverInfo = {
  object: SceneObject;
  x: number;
  y: number;
};

const DESK_HALF = 5.2;
const FLIP_MS = 560;
const LID_OPEN = 2.35;

export default function ThreeScene({
  objects,
  config,
  onHover,
  onPin,
  onResetRef,
  onUnavailable,
  highlightId,
}: {
  objects: SceneObject[];
  config: SceneConfig;
  onHover: (info: HoverInfo | null) => void;
  /** `info` objects pin their card open; tapping empty desk unpins it. */
  onPin: (info: HoverInfo | null) => void;
  /** Filled with a function the page's Reset button calls. */
  onResetRef: (reset: (() => void) | null) => void;
  /** WebGL refused a context after all; the caller shows the flat collage. */
  onUnavailable: () => void;
  /** Focusing an item in the accessible list lights up its object. */
  highlightId: string | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<string | null>(null);
  /** Set by the scene effect: redraws once, even when the desk is asleep. */
  const wakeRef = useRef<(() => void) | null>(null);

  // A highlight from the list has to reach a loop that may be asleep, so it is
  // handed over here and the scene is asked for one more frame.
  useEffect(() => {
    highlightRef.current = highlightId;
    wakeRef.current?.();
  }, [highlightId]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      // The probe said yes but no context came back - a lost GPU, or too many
      // contexts open. The caller shows the flat collage instead.
      onUnavailable();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shown = objects.slice(0, config.maxObjects);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.dprMax));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      host.clientWidth / Math.max(1, host.clientHeight),
      0.1,
      100,
    );
    // Near top-down, tipped just enough that objects read as objects rather
    // than as flat shapes.
    camera.position.set(0, 12.5, 7.2);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 11, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -9;
    key.shadow.camera.right = 9;
    key.shadow.camera.top = 9;
    key.shadow.camera.bottom = -9;
    scene.add(key);

    // Shadow-only ground, so the plate colour shows through in both themes.
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: config.shadowOpacity }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ---- physics ---- */
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, config.gravity, 0) });
    world.allowSleep = true;
    (world.solver as CANNON.GSSolver).iterations = 6;

    const propMaterial = new CANNON.Material("prop");
    const surfaceMaterial = new CANNON.Material("surface");
    const ballMaterial = new CANNON.Material("ball");
    world.addContactMaterial(
      new CANNON.ContactMaterial(propMaterial, surfaceMaterial, {
        restitution: 0.22,
        friction: 0.42,
      }),
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(ballMaterial, surfaceMaterial, {
        restitution: 0.78,
        friction: 0.3,
      }),
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(ballMaterial, propMaterial, { restitution: 0.55 }),
    );

    const floor = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: surfaceMaterial,
    });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floor);

    // Invisible walls, so a hard throw cannot lose an object off the desk.
    for (const [nx, nz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const wall = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
        material: surfaceMaterial,
      });
      wall.position.set(-nx * DESK_HALF, 0, -nz * DESK_HALF);
      wall.quaternion.setFromVectors(new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(nx, 0, nz));
      world.addBody(wall);
    }

    /* ---- the objects ---- */
    const textures = new THREE.TextureLoader();
    textures.setCrossOrigin("anonymous");
    const loaded: THREE.Texture[] = [];
    const gltf = new GLTFLoader();
    let disposed = false;
    const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";

    const kit: Kit = {
      texture: (url) => {
        const map = textures.load(url, () => {
          if (!disposed) render();
        });
        map.colorSpace = THREE.SRGBColorSpace;
        loaded.push(map);
        return map;
      },
      back: (object) => {
        const map = cardBack(object, fontFamily);
        loaded.push(map);
        return map;
      },
      gltf,
      onLoad: () => {
        if (!disposed) render();
      },
    };

    const props: Prop[] = [];

    shown.forEach((object, index) => {
      const home = restingPlace(index);
      const x = object.posX ?? home.x;
      const z = object.posZ ?? home.z;
      const rotY = ((object.rotY ?? home.rotY) * Math.PI) / 180;
      const s = Math.max(0.3, Math.min(3, object.scale));

      const built = buildProp(object, s, kit);

      built.group.position.set(x, built.half.y + 0.02, z);
      built.group.rotation.y = rotY;
      built.group.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      scene.add(built.group);

      const body = new CANNON.Body({
        mass: built.mass,
        shape: built.shape,
        material: object.objectType === "ball" ? ballMaterial : propMaterial,
        allowSleep: true,
        linearDamping: 0.22,
        angularDamping: 0.34,
      });
      body.position.set(x, built.half.y + 0.02, z);
      body.quaternion.setFromEuler(0, rotY, 0);
      world.addBody(body);

      props.push({
        object,
        group: built.group,
        body,
        dragHeight: built.half.y + 1.5,
        home: {
          position: body.position.clone(),
          quaternion: body.quaternion.clone(),
        },
        lid: built.lid,
        lidTarget: 0,
        tween: null,
      });
    });

    // Drop-in: the objects arrive rather than simply being there.
    if (config.dropInOnLoad && !reduced) {
      props.forEach((prop, i) => {
        prop.body.sleep();
        window.setTimeout(() => {
          if (disposed) return;
          prop.body.position.y += 3.2 + i * 0.12;
          prop.body.wakeUp();
          wake();
        }, 120 + i * 70);
      });
    }

    /* ---- picking, dragging, tapping ---- */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();

    let held: Prop | null = null;
    let heldFrom = { x: 0, y: 0 };
    let heldMoved = false;
    let heldVelocity = new THREE.Vector3();
    const heldLast = new THREE.Vector3();
    let hovered: Prop | null = null;
    let hoverTimer: number | null = null;

    const setPointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pick = (): Prop | null => {
      raycaster.setFromCamera(pointer, camera);
      let nearest: { prop: Prop; distance: number } | null = null;
      for (const prop of props) {
        const hits = raycaster.intersectObject(prop.group, true);
        if (hits.length > 0 && (!nearest || hits[0].distance < nearest.distance)) {
          nearest = { prop, distance: hits[0].distance };
        }
      }
      return nearest?.prop ?? null;
    };

    /** Where an object is on the page, for the HTML card that describes it. */
    const screenOf = (prop: Prop): HoverInfo => {
      const point = prop.group.position.clone().project(camera);
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        object: prop.object,
        x: rect.left + ((point.x + 1) / 2) * rect.width,
        y: rect.top + ((-point.y + 1) / 2) * rect.height,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      setPointer(e);

      if (held) {
        dragPlane.constant = -held.dragHeight;
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(dragPlane, hit)) {
          heldVelocity = hit.clone().sub(heldLast).multiplyScalar(9);
          heldLast.copy(hit);
          held.body.position.set(
            Math.max(-DESK_HALF + 0.5, Math.min(DESK_HALF - 0.5, hit.x)),
            held.dragHeight,
            Math.max(-DESK_HALF + 0.5, Math.min(DESK_HALF - 0.5, hit.z)),
          );
          held.body.velocity.setZero();
          held.body.angularVelocity.scale(0.6, held.body.angularVelocity);
        }
        if (Math.hypot(e.clientX - heldFrom.x, e.clientY - heldFrom.y) > 5) {
          heldMoved = true;
          clearHover();
        }
        wake();
        return;
      }

      const over = pick();
      renderer.domElement.style.cursor = over ? "grab" : "default";
      if (over !== hovered) {
        clearHover();
        hovered = over;
        wake();
        if (over) {
          hoverTimer = window.setTimeout(
            () => onHover(screenOf(over)),
            config.infoDelayMs,
          );
        }
      }
    };

    function clearHover() {
      if (hoverTimer !== null) window.clearTimeout(hoverTimer);
      hoverTimer = null;
      onHover(null);
    }

    const onPointerDown = (e: PointerEvent) => {
      setPointer(e);
      const target = pick();
      if (!target) {
        // A tap on bare desk puts a pinned card away.
        onPin(null);
        return;
      }
      if (target.tween) return;
      held = target;
      heldMoved = false;
      heldFrom = { x: e.clientX, y: e.clientY };
      heldVelocity.set(0, 0, 0);
      dragPlane.constant = -target.dragHeight;
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(dragPlane, hit);
      heldLast.copy(hit);
      target.body.wakeUp();
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = "grabbing";
      wake();
    };

    const onPointerUp = () => {
      if (!held) return;
      const prop = held;
      held = null;
      renderer.domElement.style.cursor = "grab";

      if (heldMoved) {
        // Thrown: carry the pointer's own speed into the object.
        prop.body.velocity.set(heldVelocity.x, 1.2, heldVelocity.z);
        if (!reduced) {
          prop.body.angularVelocity.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
          );
        }
      } else {
        act(prop);
      }
      wake();
    };

    function act(prop: Prop) {
      const body = prop.body;
      body.wakeUp();
      switch (prop.object.action) {
        case "kick":
          body.velocity.set((Math.random() - 0.5) * 6, 9, -7);
          body.angularVelocity.set(6, 3, 2);
          break;

        case "flip": {
          // Scripted rather than thrown: half a turn about the object's long
          // axis, so it lands face down every time and shows its back.
          const turn = new CANNON.Quaternion();
          turn.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);
          const to = body.quaternion.mult(turn);
          if (reduced) {
            body.quaternion.copy(to);
            body.velocity.setZero();
            body.angularVelocity.setZero();
            break;
          }
          body.type = CANNON.Body.KINEMATIC;
          body.velocity.setZero();
          body.angularVelocity.setZero();
          prop.tween = {
            start: performance.now(),
            duration: FLIP_MS,
            from: body.quaternion.clone(),
            to,
            baseY: body.position.y,
            lift: 1.4,
          };
          break;
        }

        case "open":
          if (prop.lid) {
            prop.lidTarget = prop.lidTarget === 0 ? LID_OPEN : 0;
            if (reduced) prop.lid.rotation.z = prop.lidTarget;
          } else {
            // Nothing to open on a shape with no lid; a hop says it heard.
            body.velocity.set(0, 5.5, 0);
            body.angularVelocity.set(0, reduced ? 0 : 4, 0);
          }
          break;

        case "spin":
          if (!reduced) {
            body.angularVelocity.set(
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 14,
              (Math.random() - 0.5) * 10,
            );
          }
          body.velocity.y = 2.4;
          break;

        case "link":
          if (prop.object.linkUrl) {
            window.open(prop.object.linkUrl, "_blank", "noopener,noreferrer");
          }
          break;

        default:
          // "info": keep the card open until the desk is tapped elsewhere.
          clearHover();
          onPin(screenOf(prop));
          break;
      }
    }

    const onPointerLeave = () => {
      clearHover();
      hovered = null;
      wake();
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

    /* ---- the loop ----
       It runs while anything is awake, tweening or opening, and stops when the
       desk settles - which is what keeps an idle tab at zero cost. */
    let raf: number | null = null;
    let lastTime = performance.now();

    function render() {
      renderer.render(scene, camera);
    }

    function wake() {
      if (raf !== null) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function loop(now: number) {
      raf = null;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      world.step(1 / 60, dt, 3);

      let busy = held !== null;
      for (const prop of props) {
        const body = prop.body;

        if (prop.tween) {
          const tween = prop.tween;
          const t = Math.min(1, (now - tween.start) / tween.duration);
          const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
          tween.from.slerp(tween.to, eased, body.quaternion);
          body.position.y = tween.baseY + Math.sin(Math.PI * t) * tween.lift;
          if (t >= 1) {
            body.quaternion.copy(tween.to);
            body.position.y = tween.baseY;
            body.type = CANNON.Body.DYNAMIC;
            body.wakeUp();
            prop.tween = null;
          }
          busy = true;
        }

        if (prop.lid) {
          const delta = prop.lidTarget - prop.lid.rotation.z;
          if (Math.abs(delta) > 0.001) {
            prop.lid.rotation.z += delta * Math.min(1, dt * 9);
            busy = true;
          } else {
            prop.lid.rotation.z = prop.lidTarget;
          }
        }

        prop.group.position.set(body.position.x, body.position.y, body.position.z);
        prop.group.quaternion.set(
          body.quaternion.x,
          body.quaternion.y,
          body.quaternion.z,
          body.quaternion.w,
        );
        if (body.sleepState !== CANNON.Body.SLEEPING) busy = true;

        const lit = highlightRef.current === prop.object.id || hovered === prop;
        prop.group.scale.setScalar(lit ? 1.06 : 1);
      }

      render();
      if (busy && !document.hidden) raf = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
      } else {
        wake();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    render();
    wake();

    /* ---- resize ---- */
    const observer = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    });
    observer.observe(host);

    /* ---- reset ---- */
    const reset = () => {
      onPin(null);
      props.forEach((prop, i) => {
        const body = prop.body;
        prop.tween = null;
        body.type = CANNON.Body.DYNAMIC;
        body.position.copy(prop.home.position);
        body.quaternion.copy(prop.home.quaternion);
        body.velocity.setZero();
        body.angularVelocity.setZero();
        prop.lidTarget = 0;
        if (prop.lid && reduced) prop.lid.rotation.z = 0;
        if (config.dropInOnLoad && !reduced) body.position.y += 1.6 + i * 0.05;
        body.wakeUp();
      });
      wake();
    };
    onResetRef(reset);
    wakeRef.current = wake;

    return () => {
      disposed = true;
      onResetRef(null);
      wakeRef.current = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf !== null) cancelAnimationFrame(raf);
      if (hoverTimer !== null) window.clearTimeout(hoverTimer);

      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);

      // WebGL holds on to everything until it is told not to.
      scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      loaded.forEach((map) => map.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [objects, config, onHover, onPin, onResetRef, onUnavailable]);

  return <div ref={hostRef} className="about-scene-host" />;
}

/* ------------------------------------------------------------ shapes ---- */

type Kit = {
  texture: (url: string) => THREE.Texture;
  back: (object: SceneObject) => THREE.Texture;
  gltf: GLTFLoader;
  onLoad: () => void;
};

type Built = {
  group: THREE.Group;
  shape: CANNON.Shape;
  half: THREE.Vector3;
  mass: number;
  lid: THREE.Object3D | null;
};

/** The physical form of each kind of favourite. Everything but `model` is made
 *  from primitives, so the scene works before a single asset is uploaded. */
function buildProp(object: SceneObject, scale: number, kit: Kit): Built {
  const group = new THREE.Group();
  const tint = CATEGORY_TINT[object.category] ?? "#8a8f8b";

  const faced = (url: string | null, fallback: string) =>
    url
      ? new THREE.MeshStandardMaterial({ map: kit.texture(url), roughness: 0.75 })
      : new THREE.MeshStandardMaterial({ color: fallback, roughness: 0.8 });

  switch (object.objectType) {
    case "ball": {
      const r = 0.42 * scale;
      group.add(
        new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), faced(object.textureUrl, tint)),
      );
      return {
        group,
        shape: new CANNON.Sphere(r),
        half: new THREE.Vector3(r, r, r),
        mass: 0.6,
        lid: null,
      };
    }

    case "book": {
      // A block of pages with the cover as its own piece, hinged on the spine
      // (the -x edge), so `open` can actually open it.
      const half = new THREE.Vector3(0.62 * scale, 0.11 * scale, 0.86 * scale);
      const board = 0.018 * scale;
      const page = new THREE.MeshStandardMaterial({ color: "#efeee8", roughness: 1 });
      const spine = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.9 });

      const pages = new THREE.Mesh(
        new THREE.BoxGeometry(half.x * 2, half.y * 2 - board, half.z * 2),
        // +x, -x, +y, -y, +z, -z: the spine is the -x face.
        [page, spine, page, spine, page, page],
      );
      pages.position.y = -board / 2;
      group.add(pages);

      const hinge = new THREE.Object3D();
      hinge.position.set(-half.x, half.y - board, 0);
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(half.x * 2, board, half.z * 2),
        [spine, spine, faced(object.textureUrl, tint), spine, spine, spine],
      );
      cover.position.set(half.x, board / 2, 0);
      hinge.add(cover);
      group.add(hinge);

      return { group, shape: boxOf(half), half, mass: 0.8, lid: hinge };
    }

    case "polaroid": {
      const half = new THREE.Vector3(0.58 * scale, 0.025 * scale, 0.68 * scale);
      group.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2),
          new THREE.MeshStandardMaterial({ color: "#f7f6f1", roughness: 0.95 }),
        ),
      );
      const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(half.x * 1.66, half.z * 1.5),
        faced(object.textureUrl, tint),
      );
      photo.rotation.x = -Math.PI / 2;
      photo.position.set(0, half.y + 0.002, -half.z * 0.14);
      group.add(photo);
      return { group, shape: boxOf(half), half, mass: 0.35, lid: null };
    }

    case "controller": {
      const half = new THREE.Vector3(0.62 * scale, 0.14 * scale, 0.36 * scale);
      const shell = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.55 });
      group.add(
        new THREE.Mesh(new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2), shell),
      );
      for (const side of [-1, 1]) {
        const grip = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.11 * scale, 0.26 * scale, 4, 10),
          shell,
        );
        grip.rotation.z = side * 0.35;
        grip.position.set(side * half.x * 0.78, -half.y * 0.5, half.z * 0.5);
        group.add(grip);
      }
      return { group, shape: boxOf(half), half, mass: 0.7, lid: null };
    }

    case "model": {
      const half = new THREE.Vector3(0.45 * scale, 0.45 * scale, 0.45 * scale);
      const standIn = () =>
        new THREE.Mesh(
          new THREE.IcosahedronGeometry(half.x, 0),
          new THREE.MeshStandardMaterial({ color: tint, roughness: 0.8 }),
        );
      if (object.modelUrl) {
        kit.gltf.load(
          object.modelUrl,
          (result) => {
            // Fit whatever came in to the object's box, centred on it.
            const box = new THREE.Box3().setFromObject(result.scene);
            const size = box.getSize(new THREE.Vector3());
            const fit = (half.x * 2) / Math.max(size.x, size.y, size.z, 0.001);
            result.scene.scale.setScalar(fit);
            const centre = box.getCenter(new THREE.Vector3()).multiplyScalar(fit);
            result.scene.position.sub(centre);
            result.scene.traverse((node) => {
              if ((node as THREE.Mesh).isMesh) node.castShadow = true;
            });
            group.add(result.scene);
            kit.onLoad();
          },
          undefined,
          () => {
            // A model that will not load still leaves a real object behind.
            group.add(standIn());
            kit.onLoad();
          },
        );
      } else {
        group.add(standIn());
      }
      return { group, shape: boxOf(half), half, mass: 0.7, lid: null };
    }

    default: {
      // "card": a poster, a key art, a photo - a thin slab with the picture on
      // its face and the title and note on its back.
      const half = new THREE.Vector3(0.52 * scale, 0.035 * scale, 0.76 * scale);
      const edge = new THREE.MeshStandardMaterial({ color: "#20211e", roughness: 0.9 });
      const back = new THREE.MeshStandardMaterial({ map: kit.back(object), roughness: 0.95 });
      group.add(
        new THREE.Mesh(new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2), [
          edge,
          edge,
          faced(object.textureUrl, CATEGORY_TINT[object.category]),
          back,
          edge,
          edge,
        ]),
      );
      return { group, shape: boxOf(half), half, mass: 0.45, lid: null };
    }
  }
}

function boxOf(half: THREE.Vector3) {
  return new CANNON.Box(new CANNON.Vec3(half.x, half.y, half.z));
}

/**
 * The reverse of a card: its title, subtitle and note, drawn to a texture.
 *
 * BoxGeometry maps its -y face with the image's top towards +z. A flip is half
 * a turn about the card's long (z) axis, which leaves that face up but turned
 * through 180 degrees - so the texture is turned back by the same amount, and
 * the note reads the right way up once the card lands.
 */
function cardBack(object: SceneObject, fontFamily: string): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 748;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#23241f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pad = 46;
    let y = 96;
    const lines = (text: string, font: string, colour: string, lineHeight: number) => {
      ctx.font = font;
      ctx.fillStyle = colour;
      const words = text.split(/\s+/);
      let line = "";
      for (const word of words) {
        const attempt = line ? `${line} ${word}` : word;
        if (ctx.measureText(attempt).width > canvas.width - pad * 2 && line) {
          ctx.fillText(line, pad, y);
          y += lineHeight;
          line = word;
        } else {
          line = attempt;
        }
      }
      if (line) {
        ctx.fillText(line, pad, y);
        y += lineHeight;
      }
    };

    lines(object.title, `600 44px ${fontFamily}`, "#f4f5f4", 52);
    if (object.subtitle) {
      y += 4;
      lines(object.subtitle, `400 28px ${fontFamily}`, "#a4a5a1", 36);
    }
    if (object.note) {
      y += 30;
      lines(object.note, `400 27px ${fontFamily}`, "#d1d2cd", 38);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  map.center.set(0.5, 0.5);
  map.rotation = Math.PI;
  return map;
}

/** Only used where a favourite has no artwork yet - a neutral stand-in, never a
 *  claim about what the thing is. */
const CATEGORY_TINT: Record<SceneObject["category"], string> = {
  movie: "#5a6b86",
  anime: "#8a6b86",
  football: "#4f7d63",
  game: "#6b6486",
  travel: "#86775a",
  music: "#7d5a5f",
  other: "#7b7f7a",
};
