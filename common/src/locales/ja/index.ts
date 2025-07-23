import type { Translation } from '../en';
import { default as homepage } from './homepage';

export const ja: Translation = {
  homepage,
  common: {
    app: {
      name: 'ネロリの研究所',
      tagline: '睡眠チーム最適化ツール'
    },
    actions: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      add: '追加',
      remove: '削除',
      search: '検索',
      filter: 'フィルター',
      reset: 'リセット',
      close: '閉じる',
      back: '戻る',
      next: '次へ'
    },
    status: {
      loading: '読み込み中...',
      saving: '保存中...',
      success: '成功',
      error: 'エラー',
      warning: '警告'
    },
    language: {
      title: '言語'
    }
  }
};
