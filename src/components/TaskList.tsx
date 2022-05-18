import { List } from "@raycast/api";
import { Project } from "@doist/todoist-api-typescript";
import { Labels, SectionWithTasks, ViewMode } from "../types";
import TaskListItem from "./TaskListItem";

interface TaskListProps {
  sections: SectionWithTasks[];
  isLoading: boolean;
  mode?: ViewMode;
  projects?: Project[];
  labels?: Labels
}

function TaskList({ isLoading, sections, mode = ViewMode.date, projects, labels }: TaskListProps): JSX.Element {
  const placeholder = `Filter tasks by name${
    mode === ViewMode.date ? ", priority (e.g p1), or project name (e.g Work)" : " or priority (e.g p1)"
  }`;

  return (
    <List searchBarPlaceholder={placeholder} isLoading={isLoading}>
      {sections.map((section, index) => {
        const subtitle = `${section.tasks.length} ${section.tasks.length === 1 ? "task" : "tasks"}`;

        return (
          <List.Section title={section.name} subtitle={subtitle} key={index}>
            {section.tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                labels={labels?.filter((label) => {
                  if (task.labelIds.includes(label.id)) {
                    return true;
                  }
                  return false;
                }).map(({ name }) => name)}
                mode={mode}
                {...(projects ? { projects } : {})}
              />
            ))}
          </List.Section>
        );
      })}
    </List>
  );
}

export default TaskList;
