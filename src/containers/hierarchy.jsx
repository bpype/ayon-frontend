import { useState, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Section, Toolbar, InputText, TablePanel } from '@ynput/ayon-react-components'

import { Column } from 'primereact/column'
import { TreeTable } from 'primereact/treetable'
import { MultiSelect } from 'primereact/multiselect'
import { ContextMenu } from 'primereact/contextmenu'

import { CellWithIcon } from '/src/components/icons'
import EntityDetail from '/src/containers/entityDetail'

import {
  setFocusedFolders,
  setBreadcrumbs,
  setExpandedFolders,
  setDialog,
} from '/src/features/context'
import { getFolderTypeIcon } from '/src//utils'
import { setFocusedType } from '../features/context'
import { useGetHierarchyQuery } from '/src/services/getHierarchy'

const filterHierarchy = (text, folder) => {
  let result = []
  if (!folder) return []
  for (const item of folder) {
    if (item.name && (!text || item.name.toLowerCase().includes(text.toLowerCase()))) {
      const newChildren = filterHierarchy(false, item.children)
      result.push({
        key: item.id,
        children: newChildren,
        data: {
          name: item.name,
          label: item.label,
          status: item.status,
          folderType: item.folderType,
          hasSubsets: item.hasSubsets,
          hasTasks: item.hasTasks,
          parents: item.parents,
          body: <CellWithIcon icon={getFolderTypeIcon(item.folderType)} text={item.label} />,
        },
      })
    } else if (item.children) {
      const newChildren = filterHierarchy(text, item.children)
      if (newChildren.length > 0) {
        result.push({
          key: item.id,
          children: newChildren,
          data: {
            name: item.name,
            label: item.label,
            status: item.status,
            folderType: item.folderType,
            hasSubsets: item.hasSubsets,
            hasTasks: item.hasTasks,
            parents: item.parents,
            body: <CellWithIcon icon={getFolderTypeIcon(item.folderType)} text={item.label} />,
          },
        })
      }
    }
  }
  return result
}

const Hierarchy = (props) => {
  const projectName = useSelector((state) => state.context.projectName)
  const folderTypes = useSelector((state) => state.context.project.folderTypes)
  // const focusedType = useSelector((state) => state.context.focused.type)
  const expandedFolders = useSelector((state) => state.context.expandedFolders)
  const focusedFolders = useSelector((state) => state.context.focused.folders)

  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [selectedFolderTypes, setSelectedFolderTypes] = useState([])
  const ctxMenuRef = useRef(null)
  const [showDetail, setShowDetail] = useState(false)

  //
  // Hooks
  //

  // Fetch the hierarchy data from the server, when the project changes
  // or when user changes the folder types to be displayed
  //TODO: use axios params here
  // if (selectedFolderTypes) url += `?types=${selectedFolderTypes.join(',')}`
  const { isError, error, isLoading, data } = useGetHierarchyQuery({ projectName })

  // We already have the data, so we can do the client-side filtering
  // and tree transformation

  const treeData = useMemo(() => {
    if (!data) return []
    return filterHierarchy(query, data)
  }, [data, query])

  //
  // Selection
  //

  // Transform the plain list of focused folder ids to a map
  // {id: true}, which is needed for the Treetable

  const selectedFolders = useMemo(() => {
    if (!focusedFolders) return []
    const r = {}
    for (const tid of focusedFolders) r[tid] = true
    return r
  }, [focusedFolders])

  // Set breadcrumbs on row click (the latest selected folder,
  // will be the one that is displayed in the breadcrumbs)

  const onRowClick = (event) => {
    const node = event.node.data
    dispatch(
      setBreadcrumbs({
        parents: node.parents,
        folder: node.name,
      }),
    )
  }

  // Update the folder selection in the project context

  const onSelectionChange = (event) => {
    const selection = Object.keys(event.value)
    dispatch(setFocusedFolders(selection))
  }

  const onContextMenuSelectionChange = (event) => {
    if (focusedFolders.includes(event.value)) return
    dispatch(setFocusedFolders([event.value]))
  }

  const onToggle = (event) => {
    dispatch(setExpandedFolders(event.value))
  }

  //
  // Folder types
  //

  // Transform a list of folder types to a list of objects
  // compatible with the MultiSelect component

  const folderTypeList = folderTypes.map((e) => ({
    label: e.name,
    value: e.name,
  }))

  // Custom "selected folder type" render template for the multiselect
  // component

  const selectedTypeTemplate = (option) => {
    if (option) {
      const folder_type_label = option ? option.replace(/[a-z]/g, '') : '??'
      return <span style={{ marginRight: '10px' }}>{folder_type_label}</span>
    }
    return 'Folder types'
  }

  const handleEditTags = () => {
    // set focused type if not already
    dispatch(setFocusedType('folder'))

    // open dialog
    dispatch(
      setDialog({
        type: 'tags',
      }),
    )
  }

  const ctxMenuModel = [
    {
      label: 'Detail',
      command: () => setShowDetail(true),
    },
    {
      label: 'Edit Tags',
      command: handleEditTags,
    },
  ]

  //
  // Render
  //

  if (isError) {
    toast.error(`Unable to load hierarchy. ${error}`)

    return <>Error...</>
  }

  return (
    <Section style={props.style}>
      <Toolbar>
        <InputText
          style={{ flexGrow: 1, minWidth: 100 }}
          placeholder="Filter folders..."
          disabled={!projectName || isLoading}
          value={query}
          onChange={(evt) => setQuery(evt.target.value)}
        />

        <MultiSelect
          value={selectedFolderTypes}
          options={folderTypeList}
          placeholder="Select folder types"
          showClear={true}
          optionLabel="label"
          disabled={!projectName || isLoading}
          selectedItemTemplate={selectedTypeTemplate}
          onChange={(e) => setSelectedFolderTypes(e.value)}
          style={{ flexBasis: 150 }}
        />
      </Toolbar>

      <TablePanel loading={isLoading}>
        <ContextMenu model={ctxMenuModel} ref={ctxMenuRef} />
        <EntityDetail
          projectName={projectName}
          entityType="folder"
          entityIds={focusedFolders}
          visible={showDetail}
          onHide={() => setShowDetail(false)}
        />
        <TreeTable
          value={treeData}
          responsive="true"
          scrollable
          scrollHeight="100%"
          selectionMode="multiple"
          selectionKeys={selectedFolders}
          expandedKeys={expandedFolders}
          emptyMessage=" "
          onSelectionChange={onSelectionChange}
          onToggle={onToggle}
          onRowClick={onRowClick}
          onContextMenu={(e) => ctxMenuRef.current?.show(e.originalEvent)}
          onContextMenuSelectionChange={onContextMenuSelectionChange}
        >
          <Column header="Hierarchy" field="body" expander={true} style={{ width: '100%' }} />
          {/*<Column header="Status" field="status" />*/}
        </TreeTable>
      </TablePanel>
    </Section>
  )
}

export default Hierarchy
