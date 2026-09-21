import type { InterestRow } from "@/lib/supabase/types";

/** What the scene needs from a row, flattened so the renderer never has to
 *  know about the database. */
export type SceneObject = {
  id: string;
  title: string;
  subtitle: string | null;
  note: string | null;
  linkUrl: string | null;
  textureUrl: string | null;
  modelUrl: string | null;
  objectType: InterestRow["object_type"];
  action: InterestRow["action"];
  category: InterestRow["category"];
  scale: number;
  posX: number | null;
  posZ: number | null;
  rotY: number | null;
  credit: string | null;
  licence: string | null;
};

export function toSceneObject(row: InterestRow): SceneObject {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    note: row.note,
    linkUrl: row.link_url,
    textureUrl: row.texture_url,
    modelUrl: row.model_url,
    objectType: row.object_type,
    action: row.action,
    category: row.category,
    scale: row.scale ?? 1,
    posX: row.pos_x,
    posZ: row.pos_z,
    rotY: row.rot_y,
    credit: row.credit,
    licence: row.licence,
  };
}

/** A tidy default arrangement on the desk, used for anything the studio has
 *  not been asked to place by hand. Spiral outwards so nothing lands on top of
 *  anything else however many objects there are. */
export function restingPlace(index: number): { x: number; z: number; rotY: number } {
  const golden = 2.399963;
  const radius = 0.9 + Math.sqrt(index) * 1.15;
  return {
    x: Math.cos(index * golden) * radius,
    z: Math.sin(index * golden) * radius,
    rotY: (index * 37) % 360,
  };
}
