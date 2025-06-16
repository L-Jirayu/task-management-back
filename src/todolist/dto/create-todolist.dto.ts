export class CreateTodoListDto {
  readonly name: string;
  readonly description?: string;
  readonly language: 'th' | 'en';
  readonly status?: boolean;
  readonly date?: Date;
  readonly datecomplete?: Date;
  readonly assignee?: string;

  readonly subtasks?: {
    title: string;
    done?: boolean;
  }[];
}
