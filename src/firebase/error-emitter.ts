
'use client';

import { EventEmitter } from 'events';

export const errorEmitter = new EventEmitter();

errorEmitter.on('permission-error', (error) => {
  console.error('Firestore permission error:', error);
});
