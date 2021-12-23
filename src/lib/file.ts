import * as fs from 'fs';
import * as path from 'path';
import { Stats } from 'fs';

function getFileStats(filename: string): Promise<Stats> {
  return new Promise<Stats>((resolve, reject) => fs.lstat(filename, (err, stats) => err ? reject(err) : resolve(stats)));
}

function readTextFile(filename: string): Promise<string> {
  return new Promise<string>((resolve, reject) => fs.readFile(filename, {encoding: 'utf-8'}, (err, data) => err ? reject(err) : resolve(data)));
}

function deleteFile(filename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => fs.unlink(filename, (err) => err ? reject(err) : resolve()));
}

function readBinaryFile(filename: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => fs.readFile(filename, (err, data) => err ? reject(err) : resolve(data)));
}

function readJsonFile(filename: string): Promise<any> {
  return readTextFile(filename).then(JSON.parse);
}

function fileExists(filename: string): Promise<boolean> {
  return new Promise((resolve) => fs.access(filename, fs.constants.F_OK, err => resolve(!err)));
}

function readDir(dir: string): Promise<string[]> {
  return new Promise((resolve, reject) => fs.readdir(dir, (err, files) => err ? reject(err) : resolve(files)));
}

function createDir(dir: string): Promise<void> {
  return new Promise((resolve, reject) => fs.mkdir(dir, err => err ? reject(err) : resolve()));
}

function createDirIfNotExists(dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.access(dir, fs.constants.F_OK, err => err ? fs.mkdir(dir, err => err ? reject(err) : resolve()) : resolve());
  });
}

function writeFile(filename: string, data: string | Buffer): Promise<void> {
  return new Promise((resolve, reject) => fs.writeFile(filename, data, err => err ? reject(err) : resolve()));
}

function writeJsonFile(filename: string, data: any, pretty = false): Promise<void> {
  const json = pretty ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  return new Promise((resolve, reject) => fs.writeFile(filename, json, err => err ? reject(err) : resolve()));
}

function copyFile(source: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => fs.copyFile(source, destination, err => err ? reject(err) : resolve()));
}

async function isDir(dir: string): Promise<boolean> {
  const fstats = await getFileStats(dir);
  return fstats.isDirectory();
}

async function isFile(filename: string): Promise<boolean> {
  return !(await isDir(filename));
}

async function copyDir(source: string, destination: string): Promise<void> {
  await createDirIfNotExists(destination);
  const filesOrDirs = await readDir(source);
  return void await Promise.all(filesOrDirs.map(async fileOrDir => {
    const sourcePath = path.join(source, fileOrDir);
    const destinationPath = path.join(destination, fileOrDir)
    if (await isDir(sourcePath)) {
      await copyDir(sourcePath, destinationPath)
    } else {
      await copyFile(sourcePath, destinationPath);
    }
  }));
}

export const file = {
  read: {
    text: readTextFile,
    json: readJsonFile,
    binary: readBinaryFile
  },
  write: {
    text: writeFile,
    binary: writeFile,
    json: writeJsonFile,
  },
  delete: deleteFile,
  exists: fileExists,
  copy: copyFile,
  stats: getFileStats,
  isFile: isFile,
};

export const dir = {
  copy: copyDir,
  exists: fileExists,
  read: readDir,
  create: createDir,
  createIfNotExists: createDirIfNotExists,
  isDir: isDir,
}