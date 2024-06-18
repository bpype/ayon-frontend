import { Button, InputText, SortingDropdown, Spacer } from '@ynput/ayon-react-components'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  onAssigneesChanged,
  onTasksFilterChanged,
  onTasksGroupByChanged,
  onTasksSortByChanged,
} from '/src/features/dashboard'
import MeOrUserSwitch from '/src/components/MeOrUserSwitch/MeOrUserSwitch'
import * as Styled from './DashboardTasksToolbar.styled'
import sortByOptions from './KanBanSortByOptions'

const DashboardTasksToolbar = ({ allUsers = [], isLoadingAllUsers, view, setView }) => {
  const dispatch = useDispatch()

  const user = useSelector((state) => state.user)
  const isManager = user?.data?.isManager || user?.data?.isAdmin

  // ASSIGNEES SELECT
  const assignees = useSelector((state) => state.dashboard.tasks.assignees)
  const assigneesIsMe = useSelector((state) => state.dashboard.tasks.assigneesIsMe)
  const assigneesIsAll = useSelector((state) => state.dashboard.tasks.assigneesIsAll)

  const setAssignees = (payload) => dispatch(onAssigneesChanged(payload))

  const sortByValue = useSelector((state) => state.dashboard.tasks.sortBy)
  const setSortByValue = (value) => dispatch(onTasksSortByChanged(value))

  // GROUP BY
  const groupByOptions = [
    { id: 'projectName', label: 'Project', sortOrder: true },
    { id: 'status', label: 'Status', sortOrder: true },
    { id: 'taskType', label: 'Type', sortOrder: true },
    { id: 'folderName', label: 'Folder', sortOrder: true },
  ]

  const assigneesGroupBy = { id: 'assignees', label: 'Assignee', sortOrder: true }
  if (!assigneesIsMe) {
    groupByOptions.push(assigneesGroupBy)
  }

  const groupByValue = useSelector((state) => state.dashboard.tasks.groupBy)

  const setGroupByValue = (value) => dispatch(onTasksGroupByChanged(value))

  // FILTER
  const filterValue = useSelector((state) => state.dashboard.tasks.filter)
  const setFilterValue = (value) => dispatch(onTasksFilterChanged(value))

  const handleAssigneesChange = (isMe, newAssignees = []) => {
    if (isMe) {
      // setting back to me
      const payload = {
        assigneesIsMe: true,
        assignees: assignees,
      }

      // update assignees to me
      setAssignees(payload)

      return
    } else if (!newAssignees.length) {
      // setting to all
      const payload = {
        assigneesIsMe: false,
        assignees: [],
      }

      // update assignees to me
      setAssignees(payload)

      return
    } else {
      // assignees changed, set to new assignees
      const payload = {
        assigneesIsMe: false,
        assignees: newAssignees,
      }

      // update assignees to new assignees and remove isMe
      setAssignees(payload)

      return
    }
  }

  return (
    <Styled.TasksToolbar>
      <SortingDropdown
        title="Sort by"
        options={sortByOptions}
        value={sortByValue}
        onChange={setSortByValue}
      />
      <SortingDropdown
        title="Group by"
        options={groupByOptions}
        value={groupByValue}
        onChange={setGroupByValue}
        multiSelect={false}
      />
      <InputText
        placeholder="Filter tasks..."
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />
      {isManager && !isLoadingAllUsers && (
        <MeOrUserSwitch
          value={assignees}
          onChange={(state, v) => handleAssigneesChange(state, v)}
          isMe={assigneesIsMe}
          isAll={assigneesIsAll}
          options={allUsers}
          align={'right'}
          placeholder="Assignees"
          editor
          buttonStyle={{ outline: '1px solid var(--md-sys-color-outline-variant)' }}
          style={{ zIndex: 20 }}
        />
      )}
      <Spacer />
      <Button
        label="List"
        onClick={() => setView('list')}
        selected={view === 'list'}
        icon="format_list_bulleted"
        data-tooltip="List view"
      />
      <Button
        label="Board"
        onClick={() => setView('kanban')}
        selected={view === 'kanban'}
        icon="view_kanban"
        data-tooltip="Board (kanban) view"
      />
    </Styled.TasksToolbar>
  )
}

export default DashboardTasksToolbar
