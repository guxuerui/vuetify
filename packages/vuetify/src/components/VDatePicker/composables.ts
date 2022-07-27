import type { DateAdapter } from '@/adapters/date-adapter'
import { useDate } from '@/composables/date'
import { useProxiedModel } from '@/composables/proxiedModel'
import { wrapInArray } from '@/util'
import { computed, inject, onBeforeMount, provide } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export type DatePickerProvide = {
  model: Ref<readonly any[]>
  mode: Ref<'month' | 'years'>
  input: Ref<'calendar' | 'keyboard'>
  displayDate: Ref<any>
  locale: Ref<any>
  adapter: Ref<DateAdapter<any>>
}

export const DatePickerSymbol: InjectionKey<DatePickerProvide> = Symbol.for('vuetify:date-picker')

interface DateProps {
  locale: any
  mode: 'month' | 'years'
  'onUpdate:mode': (mode: 'month' | 'years') => void
  modelValue: any
  'onUpdate:modelValue': (date: any) => void
  input: 'keyboard' | 'calendar'
  'onUpdate:input': (input: 'keyboard' | 'calendar') => void
  displayDate: any
  'onUpdate:displayDate': (displayDate: any) => void
}

export function createDatePicker (props: DateProps, range?: boolean) {
  const locale = computed(() => props.locale)
  const { adapter } = useDate(locale)
  const model = useProxiedModel(
    props,
    'modelValue',
    null,
    v => {
      const arr = wrapInArray(v)

      return arr.map(adapter.value.date)
    },
    v => {
      if (range) return v
      return v[0]
    })
  const input = useProxiedModel(props, 'input')
  const mode = useProxiedModel(props, 'mode')
  const displayDate = useProxiedModel(props, 'displayDate', null)

  onBeforeMount(() => {
    if (displayDate.value == null) {
      displayDate.value = model.value[0] ?? adapter.value.date()
    }
  })

  // TODO: Do this nicer
  // watch(() => props.modelValue, () => {
  //   const date = wrapInArray(props.modelValue)[0]
  //   displayDate.value = adapter.value.date(date)
  // })

  provide(DatePickerSymbol, {
    model,
    input,
    mode,
    displayDate,
    locale,
    adapter,
  })

  return {
    model,
    input,
    mode,
    displayDate,
    adapter,
  }
}

export function useDatePicker () {
  const datePicker = inject(DatePickerSymbol)

  if (!datePicker) throw new Error('foo')

  return datePicker
}
