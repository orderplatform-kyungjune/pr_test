#!/usr/bin/env node
import fs from 'fs';
import {execSync} from 'child_process';
import inquirer from 'inquirer';

const packageJSON = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const activatePackageJsonScript = async () => {
  const services = [
    'test_a',
    'test_b',
    'test_c',
    'test_d',
    'test_e',
    'test_f',
    'origin',
    'brand1',
    'global',
    'us_east',
    'sg',
    'sydney',
    'uplus',
    'partners',
  ];
  const operations = ['serve', 'build'];
  const environments = ['local', 'dev', 'staging', 'live'];

  /** 1. service 선택 */
  let { selectedService } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedService',
      message: 'what service do you want?',
      choices: services,
    },
  ]);

  /** 2. 작업 유형 선택 */
  const { selectedOperation } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedOperation',
      message: 'what operation do you want?',
      choices: operations,
    },
  ]);

  /** 3. 환경 선택 */
  const { selectedEnvironment } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedEnvironment',
      message: 'what environment do you want?',
      choices: environments,
    },
  ]);

  let scriptName = `${selectedService}:${selectedOperation}:${selectedEnvironment}`;
  execSync(packageJSON.scripts[scriptName], { stdio: 'inherit' });
};

await activatePackageJsonScript();
