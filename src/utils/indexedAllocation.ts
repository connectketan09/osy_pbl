import { VirtualDiskBlock, VirtualFileRecord } from '../types';

export const TOTAL_DISK_BLOCKS = 64;

/**
 * Initializes virtual disk blocks. Block 0 is reserved for Superblock.
 */
export function initializeDiskBlocks(files: VirtualFileRecord[]): VirtualDiskBlock[] {
  const blocks: VirtualDiskBlock[] = Array.from({ length: TOTAL_DISK_BLOCKS }, (_, i) => ({
    blockId: i,
    type: i === 0 ? 'SUPERBLOCK' : 'FREE',
    contentPreview: i === 0 ? 'OS Boot & Inode Superblock' : undefined,
  }));

  // Map existing files into disk blocks
  for (const file of files) {
    if (file.indexBlock < TOTAL_DISK_BLOCKS) {
      blocks[file.indexBlock] = {
        blockId: file.indexBlock,
        type: 'INDEX_BLOCK',
        fileId: file.id,
        contentPreview: `Index: [${file.dataBlocks.join(', ')}]`,
      };
    }

    file.dataBlocks.forEach((db, idx) => {
      if (db < TOTAL_DISK_BLOCKS) {
        blocks[db] = {
          blockId: db,
          type: 'DATA_BLOCK',
          fileId: file.id,
          contentPreview: `${file.type.substring(0, 4)} Part #${idx + 1}`,
        };
      }
    });
  }

  return blocks;
}

/**
 * Finds available free blocks for index block and data blocks
 */
export function allocateIndexedFile(
  currentBlocks: VirtualDiskBlock[],
  requiredDataBlocks: number
): { indexBlock: number; dataBlocks: number[] } | null {
  const freeBlocks: number[] = [];

  for (let i = 1; i < currentBlocks.length; i++) {
    if (currentBlocks[i].type === 'FREE') {
      freeBlocks.push(i);
    }
  }

  const totalNeeded = 1 + requiredDataBlocks;
  if (freeBlocks.length < totalNeeded) {
    return null; // Disk full
  }

  const indexBlock = freeBlocks[0];
  const dataBlocks = freeBlocks.slice(1, totalNeeded);

  return { indexBlock, dataBlocks };
}
