import { Task } from "@doist/todoist-api-typescript";
import { todoist } from "./api";

export enum ViewMode {
  project,
  date,
  search,
}

export interface SectionWithTasks {
  name: string;
  tasks: Task[];
}

export enum SWRKeys {
  projects = "projects",
  tasks = "tasks",
  labels = "labels",
  sections = "sections",
  comments = "comments",
}

export enum TodayGroupBy {
  default = "default",
  priority = "priority",
  project = "project",
  label = "label",
}

export enum ProjectGroupBy {
  default = "default",
  priority = "priority",
  date = "date",
  label = "label",
}

export type Labels = Awaited<ReturnType<typeof todoist.getLabels>>
