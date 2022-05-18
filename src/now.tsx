import React, { useEffect, useState } from 'react';
import { Icon, LocalStorage } from "@raycast/api";

import { Action, ActionPanel, Detail } from "@raycast/api";
import useSWR from 'swr';
import { handleError, todoist } from './api';
import { SWRKeys } from './types';
import { sortBy } from 'lodash';
import TaskDetail from './components/TaskDetail';
import TaskCommentForm from "./components/TaskCommentForm";
import { formatDistanceToNowStrict } from 'date-fns';
import TaskActions from './components/TaskActions';
import useAnimatedText from './hooks/useAnimatedText';

export default function Now() {
  const { data: tasks, error: getTasksError } = useSWR(SWRKeys.tasks, () =>
    todoist.getTasks({ filter: "today" })
      .then((tasks) => sortBy(tasks, 'priority').reverse())
  );
  const { data: projects, error: getProjectsError } = useSWR(SWRKeys.projects, () => todoist.getProjects());
  const [pinnedProject, setPinnedProject] = useState(0);


  useEffect(() => {
    fetchPinnedProject();
  }, []);

  const fetchPinnedProject = async () => {
    const pinnedProject = await LocalStorage.getItem<string>("pinnedProject");
      setPinnedProject(parseInt(pinnedProject || '', 10) || 0);
  }

  const pinProject = async (pinnedProject: number) => {
    await LocalStorage.setItem("pinnedProject", pinnedProject.toString());
    fetchPinnedProject();
  }

  if (getTasksError) {
    handleError({ error: getTasksError, title: "Unable to get tasks" });
  }

  const isLoading = (!tasks && !getTasksError) || (!projects && !getProjectsError);

  const headTasks = (projects || [])
    .filter((project) => {
      if (!pinnedProject) return true;
      return project.id === pinnedProject;
    })
    .map((project) => {
      // find tasks that have projectId = project.id
      const _tasks = tasks?.filter((task) => task.projectId === project.id) || [];
      const task = _tasks[0];
      return {task, project};
    });

  const headTask = headTasks[0]?.task;

  // console.log(headTask?.id)

  const { data: comments, error: getCommentsError } = useSWR(headTask?.id ? SWRKeys.comments : null, () =>
    todoist.getComments({ taskId: headTask?.id })
      .then((comments) => sortBy(comments, 'posted').reverse())
  );

  if (getCommentsError) {
    handleError({ error: getCommentsError, title: "Unable to get task comments" });
  }

  const formatContentToBlockquoteMrkD = (text: string) => {
    return text.split('\n').map(line => `>${line ? ` ${line.trim()}` : '　'}`).join('  \n')
  }
  const formatContentToParagraphMrkD = (text: string) => {
    return text.split('\n').map(line => `${line}  `).join('\n')
  }

  const headProject = headTasks[0]?.project;

  const content = headTask ? `# ${headTask.content}\n\n${formatContentToParagraphMrkD(headTask.description)}` : `# Let's move on to the next task!`

  const commentsContent = (comments || [])?.map((comment) => {
    return `> \`${formatDistanceToNowStrict(new Date(comment.posted))} ago\`  \n${formatContentToBlockquoteMrkD(comment.content)}`;
  }).join('\n\n');

  const animatedContent = useAnimatedText(content);

  return <Detail
    isLoading={isLoading}
    navigationTitle="Your task to do right now!"
    metadata={
      pinnedProject ?
      <Detail.Metadata>
        <Detail.Metadata.Label
          title="Project"
          text={headProject?.name}
          icon={headProject?.inboxProject ? Icon.Envelope : Icon.List}
        />
        {tasks ?
          <Detail.Metadata.Label
            title=""
            text={`${tasks.length - 1} more tasks left today`}
            icon={Icon.Document}
          />
        : null}
      </Detail.Metadata>: null
    }
    actions={
      <ActionPanel title="Actions:">
        {pinnedProject ?
          <ActionPanel.Section>
            <Action
              title={`Clear pin project`}
              onAction={() => {
                pinProject(0);
              }}
              icon={Icon.Trash}
            />
          </ActionPanel.Section> : null
        }
        <ActionPanel.Section>
          {projects?.map(project =>
            <Action
              key={project.id}
              title={`Pin ${project.name}`}
              onAction={() => pinProject(project.id)}
              icon={Icon.Pin}
            />
            )}
        </ActionPanel.Section>
        {headTask ?
          <>
            <ActionPanel.Section>
              <Action.Push title="Show Details" target={<TaskDetail task={headTask} />} icon={Icon.Sidebar} />
              <Action.Push title="Add New Comment" icon={Icon.Plus} target={<TaskCommentForm task={headTask} />} />
            </ActionPanel.Section>
            <TaskActions
              task={headTask}
            />
          </>
        : null}
      </ActionPanel>
    }
    markdown={`
${isLoading ? 'Loading...' :
`
${pinnedProject ? `
${animatedContent}

${commentsContent ? '### 💬 Comments' : ''}

${commentsContent}

![](${headTask ? 'https://res.cloudinary.com/sonchu/image/upload/a_hflip,c_pad,h_327,w_400,x_0/v1652785965/looney-head-2_rfri64.png' : 'https://res.cloudinary.com/sonchu/image/upload/c_scale,h_311/v1652896312/looney-dubbing-teenage-guy_vvwkor.png'})

---
` : `
## You need to pin a project! 👀

Press \`Cmd + K\` and pin one.${'  '}
![](https://res.cloudinary.com/sonchu/image/upload/c_fill,w_200/v1652799562/looney-hand-6_qbbpha.png)
`}

`
}
    `}
  />
}