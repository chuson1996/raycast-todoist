import { ActionPanel, Icon, List, Action, Color, Image } from "@raycast/api";
import { format } from "date-fns";
import { Project, Task } from "@doist/todoist-api-typescript";
import { ViewMode } from "../types";
import { isRecurring, displayDueDate, isExactTimeTask } from "../helpers";
import { priorities } from "../constants";
import TaskDetail from "./TaskDetail";

import TaskActions from "./TaskActions";

interface TaskListItemProps {
  task: Task;
  mode: ViewMode;
  projects?: Project[];
  labels?: string[];
}

export default function TaskListItem({ task, mode, projects, labels }: TaskListItemProps): JSX.Element {
  const additionalListItemProps: Partial<List.Item.Props> & { keywords: string[]; accessories: List.Item.Accessory[] } =
    { keywords: [], accessories: [] };

  if (mode === ViewMode.date || mode === ViewMode.search) {
    if (projects && projects.length > 0) {
      const project = projects.find((project) => project.id === task.projectId);

      if (project) {
        additionalListItemProps.accessories.push({ text: project.name });
        additionalListItemProps.keywords.push(project.name);
      }
    }
  }

  if (mode === ViewMode.project || mode === ViewMode.search) {
    if (task.due?.date) {
      additionalListItemProps.accessories.push({ text: displayDueDate(task.due.date) });
    }
  }

  if (isExactTimeTask(task)) {
    const time = task.due?.datetime as string;
    additionalListItemProps.accessories.push({
      icon: Icon.Clock,
      text: format(new Date(time), "HH:mm"),
    });
  }

  if (isRecurring(task)) {
    additionalListItemProps.accessories.push({ icon: Icon.ArrowClockwise });
  }

  if (task.labelIds.length > 0) {
    additionalListItemProps.accessories.push({ icon: { source: "tag.svg", tintColor: Color.SecondaryText } });
    additionalListItemProps.accessories.push(...(labels || []).map((label) => ({ text: label })))
  }

  if (task.commentCount > 0) {
    additionalListItemProps.accessories.push({ icon: Icon.Bubble });
  }

  const priority = priorities.find((p) => p.value === task.priority);

  if (priority) {
    let icon: Image.ImageLike = priority.value === 1 ?
      Icon.Circle :
      { source: Icon.Circle, tintColor: priority.color
    };
    if (priority.value === 4) {
      icon = { source: 'right-arrow.gif', tintColor: undefined };
    }
    additionalListItemProps.keywords.push(priority.searchKeyword);
    additionalListItemProps.icon = icon;
  }

  return (
    <List.Item
      title={task.content}
      subtitle={task.description}
      {...additionalListItemProps}
      actions={
        <ActionPanel>
          <Action.Push title="Show Details" target={<TaskDetail task={task} />} icon={Icon.Sidebar} />

          <TaskActions task={task} />
        </ActionPanel>
      }
    />
  );
}
