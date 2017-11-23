# Leaf LIMS: Frontend UI

![Leaf LIMS logo](https://leaflims.github.io/img/logo.svg)

_Leaf LIMS is a laboratory information management system (LIMS) designed to make managing projects
in a laboratory much easier. By using Leaf LIMS you can keep track of almost everything in the
laboratory including samples, results data and even consumable levels._

Leaf LIMS uses [Docker](https://docker.com) to easily bundle all the necessary components into a single package. Setting it up is as simple as downloading the latest release, editing a few configuration files and then running a single command!

**Please note: This is only the UI for Leaf LIMS. Please see the [Leaf LIMS](https://github.com/LeafLIMS/LeafLIMS) repository for the full system**

## About the frontend

The Leaf LIMS UI is written in [Aurelia](https://http://aurelia.io), a modern javascript framework. Aurelia was chosen as it is a flexible,  It makes requests to the REST API backend for data.

## Prerequisites for development

1. Git
2. NodeJS + NPM
3. [Docker](https://www.docker.com/get-docker) (In case you want to build an image)

## Setting up for development

1. Clone this repository
2. Run `npm install` to get all of the necessary tools + libraries
3. Once installed run `au run --watch` and start developing!
4. You will need a symlink to `third_party/semantic-ui/themes/` in your root directory for icons etc. to show up. On the live system the directory is copied to root.

All source code is in the `src/` directory and when run will create bundles in the `scripts/` directory and use these - this is exactly how it is run on the live system.

## Bugs and contacting the developers

If you find (or suspect you have found) a bug please check that it has not already been submitted to our [issue tracker](https://github.com/LeafLIMS/LeafLIMS/issues) and if not, submit a bug report with as much detail as you can [here](https://github.com/LeafLIMS/LeafLIMS/issues).

For non-bug related enquiries you can contact the lead developer Thomas at [thomas.craig@liverpool.ac.uk](mailto:thomas.craig@liverpool.ac.uk).

## Support

Leaf LIMS is developed by a group of three major groups at universities in the UK: [GeneMill](https://genemill.liv.ac.uk) at the University of Liverpool, the [EGF](http://www.genomefoundry.org/) at Edinburgh University and the [Earlam Institute](http://www.earlham.ac.uk/). 

If you are interested in further supporting the project please get in touch with Thomas via email at [thomas.craig@liverpool.ac.uk](mailto:thomas.craig@liverpool.ac.uk).

## Licence

Leaf LIMS is open source under the MIT licence. You can access the source code in the following repositories: For the UI see [LIMS-Frontend](https://github.com/LeafLIMS/LIMS-Frontend) and for the API see [LIMS-Backend](https://github.com/LeafLIMS/LIMS-Backend).
