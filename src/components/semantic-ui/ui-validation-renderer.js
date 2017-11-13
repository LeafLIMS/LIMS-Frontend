import { ValidationError, RenderInstruction } from 'aurelia-validation';

export class UiValidationRenderer {
    render(instruction) {
        for (let {elements, result} of instruction.unrender) {
            if (!result.valid) {
                for (let element of elements) {
                    element.parentElement.classList.remove('error');
                    let theMessage = element.parentElement.getElementsByClassName('message');
                    if (theMessage.length > 0) {
                        element.parentElement.removeChild(theMessage[0]);
                    }
                }
            }
        }
        for (let {elements, result} of instruction.render) {
            //console.log(result);
            if (!result.valid) {
                for (let element of elements) {
                    element.parentElement.classList.add('error');
                    let errorMessage = '<div class="ui visible error message">'+result.message+'</div>';
                    if (!element.parentElement.classList.contains('dropdown')) {
                        element.parentElement.insertAdjacentHTML('beforeend', errorMessage);
                    }
                }
            }
        }
    }
}
