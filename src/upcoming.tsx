import useSWR from "swr";
import TaskList from "./components/TaskList";
import { getSectionsWithDueDates } from "./helpers";
import { handleError, todoist } from "./api";
import { SWRKeys } from "./types";
import { sortBy } from "lodash";

export default function Upcoming() {
  const { data, error } = useSWR(
    SWRKeys.tasks,
    () => todoist.getTasks({ filter: "view all" })
      .then((tasks) => sortBy(tasks, 'priority').reverse())
  );

  const { data: labels, error: getLabelsError } = useSWR(SWRKeys.labels, () => todoist.getLabels());

  const { data: projects, error: getProjectsError } = useSWR(SWRKeys.projects, () => todoist.getProjects());

  if (getProjectsError) {
    handleError({ error: getProjectsError, title: "Unable to get tasks" });
  }

  if (error) {
    handleError({ error, title: "Unable to get tasks" });
  }

  if (getLabelsError) {
    handleError({ error, title: "Unable to get labels" });
  }

  const tasks = data?.filter((task) => task.due?.date) || [];
  const sections = getSectionsWithDueDates(tasks);

  return <TaskList
    sections={sections}
    labels={labels}
    isLoading={!data && !error}
    projects={projects}
  />;
}
