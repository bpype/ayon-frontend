import { InputText, InputNumber } from 'openpype-components'
import { Dropdown } from 'primereact/dropdown'
import { getFolderTypes, getTaskTypes } from '/src/utils'

import pypeClient from '/src/pype'


const typeEditor = (options, callback, value) => {
  const rowData = options.node.data
  if (!rowData) return <></>

  const types =
    rowData.__entityType === 'folder'
      ? getFolderTypes()
      : getTaskTypes()

  const onChange = (event) =>
    callback(options, event.value)

  const itemTemplate = (option, props) => {
    if (option) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <span
            className={`material-symbols-outlined`}
            style={{ marginRight: '0.6rem' }}
          >
            {option.icon}
          </span>
          <span>{option.label}</span>
        </div>
      )
    }

    return <span>{props.placeholder}</span>
  }

  // showClear={ rowData.__entityType === "folder" }
  return (
    <Dropdown
      options={types}
      optionLabel="label"
      optionValue="name"
      dataKey="name"
      value={value || '_'}
      emptyMessage="Folder"
      itemTemplate={itemTemplate}
      onChange={onChange}
      style={{ width: '100%' }}
    />
  )
}

const stringEditor = (options, callback, value) => {
  return (
    <InputText
      value={value}
      onChange={(e) => {
        callback(options, e.target.value)
      }}
    />
  )
}

const integerEditor = (options, callback, value) => {
  const attrSettings = pypeClient.getAttribSettings(options.field)

  let min = null
  if (attrSettings && attrSettings.data.hasOwnProperty('gt'))
    min = attrSettings.data.gt + 1
  else if (attrSettings && attrSettings.data.hasOwnProperty('gte'))
    min = attrSettings.data.gte

  let max = null
  if (attrSettings && attrSettings.data.hasOwnProperty('lt'))
    max = attrSettings.data.lt - 1
  else if (attrSettings && attrSettings.data.hasOwnProperty('lte'))
    max = attrSettings.data.lte

  return (
    <div className="table-editor">
      <InputNumber
        style={{ width: '100%' }}
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={(e) => {
          const val = e.target.value === '' ? null : parseInt(e.target.value)
          callback(options, val)
        }}
      />
    </div>
  )
}

const floatEditor = (options, callback, value) => {
  //  onChange={(e) => options.editorCallback(e.value)}
  const attrSettings = pypeClient.getAttribSettings(options.field)
  let min = null
  if (attrSettings && attrSettings.data.hasOwnProperty('gt'))
    min = attrSettings.data.gt + 0.00001
  else if (attrSettings && attrSettings.data.hasOwnProperty('gte'))
    min = attrSettings.data.gte

  let max = null
  if (attrSettings && attrSettings.data.hasOwnProperty('lt'))
    max = attrSettings.data.lt - 0.00001
  else if (attrSettings && attrSettings.data.hasOwnProperty('lte'))
    max = attrSettings.data.lte
  return (
    <div
      className="table-editor"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <InputNumber
        style={{ width: '100%' }}
        value={value}
        min={min}
        max={max}
        step="any"
        onChange={(e) => {
          const val = e.target.value === '' ? null : parseFloat(e.target.value)
          callback(options, val)
        }}
      />
    </div>
  )
}

export { typeEditor, stringEditor, integerEditor, floatEditor }
