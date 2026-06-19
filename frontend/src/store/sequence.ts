import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Sequence, AlignmentResult, GCContent, PhyloNode, AlignmentHistoryItem } from '../types';
import {
  needlemanWunsch,
  smithWaterman,
  calculateGCContent,
  calculateDistanceMatrix,
  buildNJTree,
  MOCK_SEQUENCES
} from '../utils/alignment';

export const useSequenceStore = defineStore('sequence', () => {
  const sequences = ref<Sequence[]>([]);
  const alignmentResult = ref<AlignmentResult | null>(null);
  const alignmentHistory = ref<AlignmentHistoryItem[]>([]);
  const currentAlgorithm = ref<'nw' | 'sw'>('nw');
  const gcData = ref<GCContent[]>([]);
  const phyloTree = ref<PhyloNode | null>(null);
  const selectedSeq1 = ref<string>('');
  const selectedSeq2 = ref<string>('');

  const alignmentIdentity = computed(() => {
    return alignmentResult.value ? alignmentResult.value.identity : 0;
  });

  const alignmentScore = computed(() => {
    return alignmentResult.value ? alignmentResult.value.score : 0;
  });

  function addSequence(id: string, name: string, data: string) {
    sequences.value.push({
      id,
      name,
      data: data.toUpperCase().replace(/[^ACGT]/g, ''),
      length: data.length
    });
  }

  function removeSequence(id: string) {
    sequences.value = sequences.value.filter(s => s.id !== id);
  }

  function runAlignment(seq1Id: string, seq2Id: string, algorithm: 'nw' | 'sw') {
    const s1 = sequences.value.find(s => s.id === seq1Id);
    const s2 = sequences.value.find(s => s.id === seq2Id);

    if (!s1 || !s2) return;

    currentAlgorithm.value = algorithm;

    let result: AlignmentResult;
    if (algorithm === 'nw') {
      result = needlemanWunsch(s1.data, s2.data);
    } else {
      result = smithWaterman(s1.data, s2.data);
    }

    alignmentResult.value = result;

    const historyItem: AlignmentHistoryItem = {
      id: 'align-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
      seq1Id: s1.id,
      seq2Id: s2.id,
      seq1Name: s1.name,
      seq2Name: s2.name,
      result,
      createdAt: Date.now()
    };
    alignmentHistory.value.push(historyItem);
  }

  function removeAlignmentHistory(id: string) {
    alignmentHistory.value = alignmentHistory.value.filter(item => item.id !== id);
  }

  function clearAlignmentHistory() {
    alignmentHistory.value = [];
    alignmentResult.value = null;
  }

  function loadMockSequences() {
    sequences.value = [];
    for (const mock of MOCK_SEQUENCES) {
      addSequence(mock.id, mock.name, mock.data);
    }
    selectedSeq1.value = MOCK_SEQUENCES[0].id;
    selectedSeq2.value = MOCK_SEQUENCES[1].id;
  }

  function buildTree() {
    if (sequences.value.length < 2) return;

    const seqData = sequences.value.map(s => ({ name: s.name, data: s.data }));
    const distMatrix = calculateDistanceMatrix(seqData);
    const names = sequences.value.map(s => s.name);
    phyloTree.value = buildNJTree(distMatrix, names);
  }

  function analyzeGC(seqId: string, windowSize: number) {
    const seq = sequences.value.find(s => s.id === seqId);
    if (!seq) return;
    gcData.value = calculateGCContent(seq.data, windowSize);
  }

  return {
    sequences,
    alignmentResult,
    alignmentHistory,
    currentAlgorithm,
    gcData,
    phyloTree,
    selectedSeq1,
    selectedSeq2,
    alignmentIdentity,
    alignmentScore,
    addSequence,
    removeSequence,
    runAlignment,
    removeAlignmentHistory,
    clearAlignmentHistory,
    loadMockSequences,
    buildTree,
    analyzeGC
  };
});
