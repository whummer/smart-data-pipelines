#!/usr/bin/env python
"""
Check all existing Docker containers for their mapped paths, and then purge any
zombie directories in docker's volumes directory which don't correspond to an
existing container.

"""
import logging
import os
import sys
from shutil import rmtree

import docker


DOCKER_VOLUMES_DIR = "/mnt/ephemeral/docker/vfs/dir"

def is_dryrun():
	return len(sys.argv) > 1 and sys.argv[1] == "--dryrun"

def get_immediate_subdirectories(a_dir):
    return [os.path.join(a_dir, name) for name in os.listdir(a_dir)
            if os.path.isdir(os.path.join(a_dir, name))]


def main():
    logging.basicConfig(level=logging.INFO)

    client = docker.Client()

    valid_dirs = []
    for container in client.containers(all=True):
        volumes = client.inspect_container(container['Id'])['Volumes']
        #logging.info("Volumes: %s", volumes)
        if not volumes:
            continue

        for _, real_path in volumes.iteritems():
            #logging.info("Volume path %s is used by container %s", real_path, container['Id'])
            if DOCKER_VOLUMES_DIR in real_path:
                logging.info("Volume path %s is used by container %s", real_path, container['Id'])
                valid_dirs.append(real_path)

    all_dirs = get_immediate_subdirectories(DOCKER_VOLUMES_DIR)
    invalid_dirs = set(all_dirs).difference(valid_dirs)

    logging.info("Purging %s dangling Docker volumes out of %s total volumes found.",
                 len(invalid_dirs), len(all_dirs))
    for invalid_dir in invalid_dirs:
    	if is_dryrun():
	        logging.info("Dryrun: Directory to purge: %s", invalid_dir)
    	else:
	        logging.info("Purging directory: %s", invalid_dir)
	        rmtree(invalid_dir)

    logging.info("All done.")
    logging.info("Processed %s dangling Docker volumes out of %s total volumes found.",
                 len(invalid_dirs), len(all_dirs))


if __name__ == "__main__":
    sys.exit(main())