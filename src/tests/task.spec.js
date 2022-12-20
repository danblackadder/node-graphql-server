import { database, server } from './config';
import resolvers from '../resolvers/task';

describe('Tasks', () => {
  database('tasks');

  describe('server', () => {
    it('Should create a new task', async () => {
      const response = await server.executeOperation({
        query:
          'mutation CreateTask($description: String!, $priority: Int) { createTask(description: $description, priority: $priority) { description }}',
        variables: { description: 'new task', priority: 1 },
      });

      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.task.description).toBe('new task');
      expect(response.body.singleResult.data?.task.priority).toBe(1);
    });
  });

  describe('resolvers', () => {
    describe('getTask', () => {
      it('Should fail to get a task with an invalid id', () => {
        expect(async () => await resolvers.Query.getTask('randomId')).rejects.toThrow();
      });

      it('Should fail to get a task with no id', () => {
        expect(async () => await resolvers.Query.getTask()).rejects.toThrow('id must be provided');
      });
    });

    describe('createTask', () => {
      it('Should create a new task to the database with only description and get saved task from database', async () => {
        const newTask = await resolvers.Mutation.createTask({ description: 'new task' });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.id).toBe(newTask.id);
        expect(fetchedTask.description).toBe(newTask.description);
      });

      it('Should create a new task to the database with both description and priority and get saved task from database', async () => {
        const newTask = await resolvers.Mutation.createTask({ description: 'new task', priority: 1 });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.id).toBe(newTask.id);
        expect(fetchedTask.description).toBe(newTask.description);
        expect(fetchedTask.priority).toBe(newTask.priority);
      });

      it('Should fail to create a new task to the database without a description', async () => {
        expect(async () => await resolvers.Mutation.createTask({})).rejects.toThrow(
          'ValidationError: description: Path `description` is required.'
        );
      });

      it('Should create a new task to the database with a number description type converted to a string', async () => {
        const newTask = await resolvers.Mutation.createTask({ description: 1 });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.id).toBe(newTask.id);
        expect(fetchedTask.description).toBe('1');
      });

      it('Should create a new task to the database with a boolean description type converted to a string', async () => {
        const newTask = await resolvers.Mutation.createTask({ description: true });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.id).toBe(newTask.id);
        expect(fetchedTask.description).toBe('true');
      });

      it('Should fail to create a new task to the database with an invalid priority type', async () => {
        expect(
          async () => await resolvers.Mutation.createTask({ description: 'new task', priority: 'test' })
        ).rejects.toThrow('ValidationError');
      });

      it('Should ignore properties that are not valid in the schema', async () => {
        const newTask = await resolvers.Mutation.createTask({
          description: 'new task',
          randomProperty: null,
        });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.randomProperty).not.toBeDefined();
      });
    });

    describe('getTasks', () => {
      it('Should return an empty array if there are no tasks in the database', async () => {
        const fetchedTasks = await resolvers.Query.getTasks();

        expect(fetchedTasks).toHaveLength(0);
      });

      it('Should get multiple tasks from database', async () => {
        await resolvers.Mutation.createTask({ description: 'new task1', priority: 1 });
        await resolvers.Mutation.createTask({ description: 'new task2', priority: 2 });
        const fetchedTasks = await resolvers.Query.getTasks();

        expect(fetchedTasks).toHaveLength(2);
        expect(fetchedTasks[0].description).toBe('new task1');
        expect(fetchedTasks[0].priority).toBe(1);
        expect(fetchedTasks[1].description).toBe('new task2');
        expect(fetchedTasks[1].priority).toBe(2);
      });
    });

    describe('updateTasks', () => {
      it('Should update a tasks description from the database', async () => {
        const newTask = await resolvers.Mutation.createTask({ description: 'new task1', priority: 1 });
        await resolvers.Mutation.updateTask({ id: newTask.id, description: 'new task2' });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.id).toBe(newTask.id);
        expect(fetchedTask.description).toBe('new task2');
        expect(fetchedTask.priority).toBe(1);
      });

      it('Should update a tasks priority from the database', async () => {
        const newTask = await resolvers.Mutation.createTask({ description: 'new task', priority: 1 });
        await resolvers.Mutation.updateTask({ id: newTask.id, priority: 2 });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.id).toBe(newTask.id);
        expect(fetchedTask.description).toBe('new task');
        expect(fetchedTask.priority).toBe(2);
      });

      it('Should fail update a task with no id', async () => {
        expect(async () => await resolvers.Mutation.updateTask({ description: 'fail' })).rejects.toThrow(
          'id must be provided'
        );
      });

      it('Should fail update a task with an invalid id', async () => {
        expect(
          async () => await resolvers.Mutation.updateTask({ id: 'invalidId', description: 'fail' })
        ).rejects.toThrow('CastError');
      });
    });

    describe('deleteTask', () => {
      it('Should delete a task from the database', async () => {
        const newTask = await resolvers.Mutation.createTask({ description: 'new task' });
        const fetchedTask = await resolvers.Query.getTask(newTask.id);

        expect(fetchedTask.id).toBe(newTask.id);

        await resolvers.Mutation.deleteTask(newTask.id);
        const fetchDeletedTask = await resolvers.Query.getTask(newTask.id);
        expect(fetchDeletedTask).toBe(null);
      });

      it('Should fail to delete a task when no id is provided', async () => {
        expect(async () => await resolvers.Mutation.deleteTask()).rejects.toThrow('id must be provided');
      });

      it('Should fail to delete a task when an invalid id is provided', async () => {
        expect(async () => await resolvers.Mutation.deleteTask('invalidId')).rejects.toThrow('CastError');
      });
    });
  });
});
