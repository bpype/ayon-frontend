import { forwardRef } from 'react'
import * as Styled from './KanBanCard.styled'

const KanBanCard = forwardRef(
  ({ task, onClick, onKeyUp, isActive, style, isOverlay, isDragging, ...props }, ref) => {
    return (
      <Styled.KanBanEntityCard
        ref={ref}
        imageUrl={task.thumbnailUrl}
        title={task.name}
        subTitle={task.folderName}
        description={task.path}
        onClick={onClick}
        isActive={isActive}
        icon={task.statusIcon}
        iconColor={task.statusColor}
        titleIcon={task.taskIcon}
        style={{ width: 210, ...style }}
        onKeyUp={onKeyUp}
        $isOverlay={isOverlay}
        $isDragging={isDragging}
        {...props}
      />
    )
  },
)

KanBanCard.displayName = 'KanBanCard'

export default KanBanCard
