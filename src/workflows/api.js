import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class WorkflowApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    runs(params) {
        return this.endpoint.find('runs/', params);
    }

    runDetail(id, params) {
        return this.endpoint.findOne('runs/', id, params);
    }

    createRun(data) {
        return this.endpoint.create('runs/', data);
    }

    updateRun(id, data) {
        return this.endpoint.patchOne('runs/', id, null, data);
    }

    tasks(params) {
        return this.endpoint.find('tasks/', params);
    }

    taskDetail(id, params) {
        return this.endpoint.findOne('tasks/', id, params);
    }

    recalculate(id, data) {
        let path = `tasks/${id}/recalculate/`;
        return this.endpoint.request('POST', path, data);
    }

    createTask(data) {
        return this.endpoint.create('tasks/', data);
    }

    updateTask(id, data) {
        return this.endpoint.patchOne('tasks/', id, null, data);
    }

    deleteTask(id) {
        return this.endpoint.destroyOne('tasks/', id);
    }

    checkTask(runId, data) {
        let path = `runs/${runId}/start_task/?is_check=True`;
        return this.endpoint.client.fetch(path, {
            method: 'post',
            body: data
        });
    }

    startTask(runId, data) {
        let path = `runs/${runId}/start_task/`;
        return this.endpoint.client.fetch(path, {
            method: 'post',
            body: data
        });
    }

    performTask(runId, data) {
        return this.endpoint.findOne('runs/', runId, 'monitor_task');
    }

    finishTask(runId, data) {
        let path = `runs/${runId}/finish_task/`;
        return this.endpoint.post(path, data);
    }

    createTaskField(data, fieldType) {
        let path = `taskfields/?type=${fieldType}`;
        return this.endpoint.create(path, data);
    }

    updateTaskField(id, data, fieldType) {
        return this.endpoint.patchOne('taskfields/', id, {type: fieldType}, data);
    }

    deleteTaskField(id, fieldType) {
        return this.endpoint.destroyOne('taskfields/', id, {type: fieldType});
    }

    workflows(params) {
        return this.endpoint.find('workflows/', params);
    }

    createWorkflow(data) {
        return this.endpoint.create('workflows/', data);
    }

    updateWorkflow(id, data) {
        return this.endpoint.patchOne('workflows/', id, null, data);
    }

    deleteWorkflow(id) {
        return this.endpoint.destroyOne('workflows/', id);
    }
}
