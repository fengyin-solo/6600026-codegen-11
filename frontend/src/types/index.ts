export interface Sequence {
  id: string;
  name: string;
  data: string;  // ACGT nucleotides
  length: number;
}

export interface AlignmentResult {
  seq1: string;
  seq2: string;
  aligned1: string;  // with gaps '-'
  aligned2: string;
  score: number;
  identity: number;  // percentage
  gaps: number;
  algorithm: string;
}

export interface AlignmentHistoryItem {
  id: string;
  seq1Id: string;
  seq2Id: string;
  seq1Name: string;
  seq2Name: string;
  result: AlignmentResult;
  createdAt: number;
}

export interface PhyloNode {
  name: string;
  branchLength: number;
  children: PhyloNode[];
  x?: number;
  y?: number;
}

export interface GCContent {
  window: number;
  position: number;
  gc: number;
}
