import fs from 'file-system';
import v from 'voca';
import { ncp } from 'ncp';
import { spawnSync, spawn } from 'child_process';
import _fs from 'fs';
import CliProgress from 'cli-progress';
import { getProjectPaths, loadAllFiles } from './utils/files';

ncp.limit = 16;

const excludedPaths = [
	'.git',
	'node_modules',
	'.npmignore',
	'.extra.npmignore',
	'.header.gitignore',
	'bin',
	'yarn.lock',
];

const excludedSpecialPaths = [
	'.DS_Store'
];

export const createProject = async ({ name }) => {
	if (!name) throw new Error('Missing project name.');

	let { source, destination } = getProjectPaths({ newProject: true });
	destination = `${destination}/${name}`;

	if (_fs.existsSync(destination)) {
		console.error(`Folder ${name} already exists at the current location.`);
		return;
	}

	fs.mkdirSync(destination);

	let files = loadAllFiles(`${source}/`).filter(file => {
		try {
			return ![...excludedPaths, ...excludedSpecialPaths].includes(file.file) && _fs.existsSync(file.full);
		}
		catch (e) {
			return false;
		}
	});

	let i = 0;
	let acceptedFilesLength = files.length;

	console.log('🛠 Creating Terrace project. 🛠');

	const progressBar = new CliProgress.Bar({}, CliProgress.Presets.shades_classic);
	progressBar.start(acceptedFilesLength, 0);

	for(let file of files) {
		let isDirectory = _fs.lstatSync(file.full).isDirectory();
		let _destination = isDirectory ? `${destination}/${file.file}/` : `${destination}/${file.file}`;

		if (isDirectory) {
			fs.mkdirSync(_destination);
			ncp(file.full, _destination, function (err) {
				if (err) return console.error(err);
				trackGeneratorProgress({ currentIndex: ++i, acceptedFilesLength, fileName: file.file, projectName: name, destination, source, progressBar });
			});
		}
		else {
			let _file = _fs.readFileSync(file.full).toString();
			let processedFile, jsonFile, mdFile, txtFile;

			switch (file.file) {
				case 'package.json':
					jsonFile = JSON.parse(_file);
					delete jsonFile.devDependencies['ncp'];
					delete jsonFile.devDependencies['cli-progress'];
					delete jsonFile.devDependencies['file-system'];
					delete jsonFile.devDependencies['yargs'];
					delete jsonFile.devDependencies['colors'];
					delete jsonFile.scripts['write-npmignore'];
					delete jsonFile.scripts['prepare'];
					delete jsonFile.scripts['build-bin'];
					delete jsonFile.scripts['write-gitignore-extra'];
					delete jsonFile.scripts['preupdate'];
					delete jsonFile.repository;
					delete jsonFile.author;
					delete jsonFile.bin;
					jsonFile.name = name;
					jsonFile.private = true;
					jsonFile.version = '0.1.0';

					processedFile = JSON.stringify(jsonFile, null, '\t');
					fs.writeFileSync(_destination, processedFile);
					break;
				case 'README.md':
					mdFile = _file.split('\n');
					mdFile[0] = `# ${v.titleCase(name)}`;
					mdFile.splice(1, 2);
					processedFile = mdFile.join('\n');
					fs.writeFileSync(_destination, processedFile);
					break;
				case '.extra.gitignore':
					_destination = `${destination}/.gitignore`;
					txtFile = _file.split('\n');
					txtFile.splice(0, 2);
					processedFile = txtFile.join('\n');
					fs.writeFileSync(_destination, processedFile);
					file.file = '.gitignore';
					break;
				default: fs.writeFileSync(_destination, _file);
			}

			trackGeneratorProgress({ currentIndex: ++i, acceptedFilesLength, fileName: file.file, projectName: name, destination, source, progressBar });
		}
	}
};

function trackGeneratorProgress({ currentIndex, acceptedFilesLength, fileName, projectName, destination, source, progressBar }) {
	if (currentIndex < acceptedFilesLength) {
		progressBar.increment();
	}
	else {
		progressBar.update(acceptedFilesLength);
		progressBar.stop();

		let postInstall = spawn('bash', [`${source}/bin/post-install.sh`, destination], { stdio: 'inherit' });
		postInstall.on('close', (code) => {
			if (code === 0) installCompleteHandler({ projectName, destination });
		});
	}
}

function installCompleteHandler({ projectName, destination}) {
	console.log(`🎉 Enjoy your terrace at ${projectName}! 🎉`);

	spawnSync(process.env.SHELL, ['-i'], {
		cwd: destination,
		stdio: 'inherit'
	});
}