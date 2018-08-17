import yargs from 'yargs';
import 'colors';

import { createProject } from './generators/create-project';
import { generateView } from './generators/generate-view';
import { generateComponent } from './generators/generate-component';
import { removeEntity } from './generators/remove-entity';

import './generators/prototype-extensions';

// noinspection JSUnusedLocalSymbols
let argv = yargs.usage('$0 [args]')
	.command('create [name]', 'Creates a loaded-up CRA project', (yargs) => {
		yargs.positional('name', {
			type: 'string',
			describe: 'Name of your project'
		});
	}, createProject)
	.command('view [name]', 'Generate a view\n[--reducer-name=[value]] [--without-reducer]', (yargs) => {
		yargs.positional('name', {
			type: 'string',
			describe: 'Creates a view with the given name'
		});
	}, generateView)
	.command('component [name]', 'Generate a component', (yargs) => {
		yargs.positional('name', {
			type: 'string',
			describe: 'Creates a component with the given name'
		});
	}, generateComponent)
	.command('remove [entity] [name]', 'Remove an entity (such as view or component)', (yargs) => {
		yargs.positional('entity', {
			type: 'string',
			describe: 'Specify the entity type to remove. eg. view, component.'
		});
		yargs.positional('name', {
			type: 'string',
			describe: 'Specify the dasherized name of the entity to remove.'
		});
	}, removeEntity)
	.option('reducer-name', {
		alias: 'r',
		default: false,
		describe: 'Specify reducer name.'.bold.green + '\nIf not provided, the default names will be the lowercase view name suffixed with `-{actions,reducer,tasks}.js`\nWorks only with the `view` command.'
	})
	.option('without-reducer', {
		alias: 'w',
		default: false,
		type: 'boolean',
		describe: 'Create a view ' + 'without a reducer'.bold.green + ', tasks, actions, and reducer test.\nWorks only with the `view` command.'
	})
	.option('without-githooks', {
		alias: 'g',
		default: false,
		type: 'boolean',
		describe: 'Create project without adding any ' + 'terrace githooks'.bold.green + '.\nWorks only with the `create` command.\n' + 'By default, the '.green + 'githooks will be included'.green.bold + ' and configured.'.green
	})
	.option('without-eslint', {
		alias: 'e',
		default: false,
		type: 'boolean',
		describe: 'Create project without adding any ' + 'extra eslint config'.bold.green + '.\nWorks only with the `create` command.' + '\n' + 'When this option is passed, githooks are automatically ignored because of current implementation logic.'.yellow
	})
	.help()
	.demandCommand()
	.argv;
