import { createMachine, guards, ref } from "@ui-machines/core"
import { nextTick, trackPointerDown } from "@ui-machines/dom-utils"
import { dom } from "./editable.dom"
import { MachineContext, MachineState } from "./editable.types"

const { not } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "editable-machine",
    initial: "unknown",
    context: {
      startWithEditView: false,
      activationMode: "focus",
      submitMode: "both",
      uid: "",
      value: "",
      previousValue: "",
      selectOnFocus: true,
      messages: {
        input: "editable input",
        edit: "edit",
        submit: "submit",
        cancel: "cancel",
      },
    },

    computed: {
      submitOnEnter: (ctx) => ["both", "enter"].includes(ctx.submitMode),
      submitOnBlur: (ctx) => ["both", "blur"].includes(ctx.submitMode),
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      isValueEmpty: (ctx) => ctx.value === "",
      isPreviewFocusable: (ctx) => ctx.activationMode === "focus",
    },

    on: {
      SET_VALUE: {
        actions: ["setValue", "invokeOnChange"],
      },
    },

    states: {
      unknown: {
        on: {
          SETUP: [
            {
              guard: "startWithEditView",
              target: "edit",
              actions: "setupDocument",
            },
            {
              target: "preview",
              actions: "setupDocument",
            },
          ],
        },
      },

      preview: {
        entry: "clearPointerdownNode",
        on: {
          EDIT: "edit",
          DBLCLICK: {
            guard: "activateOnDblClick",
            target: "edit",
          },
          FOCUS: {
            guard: "activateOnFocus",
            target: "edit",
            actions: ["setPreviousValue"],
          },
        },
      },

      edit: {
        activities: "trackPointerDown",
        entry: ["focusInput", "invokeOnEdit"],
        on: {
          TYPE: {
            guard: not("isAtMaxLength"),
            actions: ["setValue", "invokeOnChange"],
          },
          BLUR: [
            {
              guard: "submitOnBlur",
              target: "preview",
              actions: ["focusEditButton", "invokeOnSubmit"],
            },
            {
              target: "preview",
              actions: ["revertValue", "focusEditButton"],
            },
          ],
          CANCEL: {
            target: "preview",
            actions: ["focusEditButton", "revertValue", "invokeOnCancel"],
          },
          ENTER: {
            guard: "submitOnEnter",
            target: "preview",
            actions: ["setPreviousValue", "invokeOnSubmit", "focusEditButton"],
          },
          SUBMIT: {
            target: "preview",
            actions: ["setPreviousValue", "invokeOnSubmit", "focusEditButton"],
          },
        },
      },
    },
  },
  {
    guards: {
      submitOnBlur: (ctx) => ctx.submitOnBlur,
      submitOnEnter: (ctx) => ctx.submitOnEnter,
      isAtMaxLength: (ctx) => ctx.maxLength != null && ctx.value.length === ctx.maxLength,
      activateOnDblClick: (ctx) => ctx.activationMode === "dblclick",
      activateOnFocus: (ctx) => ctx.activationMode === "focus",
      startWithEditView: (ctx) => ctx.startWithEditView,
    },

    activities: {
      trackPointerDown(ctx) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
    },

    actions: {
      setupDocument(ctx, evt) {
        if (evt.doc) ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      focusEditButton(ctx) {
        nextTick(() => {
          dom.getEditBtnEl(ctx)?.focus()
        })
      },
      focusInput(ctx) {
        nextTick(() => {
          const input = dom.getInputEl(ctx)
          if (!input) return
          if (ctx.selectOnFocus) input.select()
          else input.focus()
        })
      },
      invokeOnCancel(ctx) {
        ctx.onCancel?.(ctx.previousValue)
      },
      invokeOnSubmit(ctx) {
        ctx.onSubmit?.(ctx.value)
      },
      invokeOnEdit(ctx) {
        ctx.onEdit?.()
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
      },
      setValue(ctx, evt) {
        ctx.value = evt.value
      },
      setPreviousValue(ctx) {
        ctx.previousValue = ctx.value
      },
      revertValue(ctx) {
        ctx.value = ctx.previousValue
      },
      clearPointerdownNode(ctx) {
        ctx.pointerdownNode = null
      },
    },
  },
)
