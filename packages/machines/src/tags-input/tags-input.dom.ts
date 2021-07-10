import { DOMCollection, domHelper } from "@ui-machines/utils"
import { TagsInputMachineContext } from "./tags-input.machine"

export function getElementIds(uid: string) {
  return {
    root: `tags-input-${uid}-root`,
    input: `tags-input-${uid}-input`,
    getTagId: (id: string | number) => `tags-input-${uid}-tag-${id}`,
  }
}

export function getElements(ctx: TagsInputMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  return {
    root: doc.getElementById(ids.root),
    input: doc.getElementById(ids.input) as HTMLInputElement,
    getTag: (id: string) => doc.getElementById(ids.getTagId(id)),
    getEl: (id: string) => doc.getElementById(id),
  }
}

export function collection(ctx: TagsInputMachineContext) {
  const ids = getElementIds(ctx.uid)
  const { root, input } = getElements(ctx)
  const selector = `[data-ownedby=${ids.root}]`
  const { first, last, prevById, nextById, indexOfId } = new DOMCollection(
    root,
    selector,
  )

  return {
    isInputFocused: domHelper(input).isActiveElement,
    first,
    last,
    indexOfId,
    prev: prevById,
    next: nextById,
  }
}
