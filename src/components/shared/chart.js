import { inject, bindable } from 'aurelia-framework';
import { Chart } from 'chartjs';

@inject(Element)
export class ChartCustomElement {
    @bindable data = {};
    @bindable type = 'doughnut';
    @bindable config = {};

    colours = [
        '31, 119, 180',
        '174, 199, 232',
        '255, 127, 14',
        '255, 187, 120',
        '44, 160, 44',
        '152, 223, 138',
        '214, 39, 40',
        '255, 152, 150',
        '148, 103, 189',
        '197, 176, 213',
        '140, 86, 75',
        '196, 156, 148',
        '227, 119, 194',
        '247, 182, 210',
        '127, 127, 127',
        '199, 199, 199',
        '188, 189, 34',
        '219, 219, 141',
        '23, 190, 207',
        '158, 218, 229',
    ];

    constructor(element) {
        this.element = element;
    }

    makeChart(dataset) {
        let ctx = this.element.getElementsByTagName('canvas')[0];
        this.chart = new Chart(ctx, {
            type: this.type,
            data: dataset,
            config: this.config
        });
    }

    dataToDataset() {
        let backgroundColours = [];
        let borderColours = [];
        for (let i = 0; i < this.data.data.length; i++) {
            backgroundColours.push(`rgba(${this.colours[i]}, 0.7)`);
            borderColours.push(`rgba(${this.colours[i]}, 1)`);
        }
        let dataset = {
            labels: this.data.labels,
            datasets: [{
                data: this.data.data,
                backgroundColor: backgroundColours,
                borderColor: borderColours,
                borderWidth: 1
            }],
        };
        return dataset;
    }

    dataChanged(n, o) {
        if (n) {
            let dataset = this.dataToDataset();
            this.makeChart(dataset);

            // On small screens set height so charts don't appear horribly squished
            let windowWidth = document.documentElement.clientWidth;
            if (windowWidth < 768) {
                let ctx = this.element;
                this.chart.options.maintainAspectRatio = false;
                ctx.style.height = '300px';
                this.chart.update();
                this.chart.resize();
            } else {
                this.chart.options.maintainAspectRatio = true;
            }
        }
    }

}
