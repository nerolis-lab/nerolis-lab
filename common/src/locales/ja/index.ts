import type { Translation } from '../en';
import { default as homepage } from './files/homepage';
import { default as profilepage } from './files/profilepage';
import { default as nav } from './files/nav';

export const ja: Translation = {
  homepage,
  profilepage,
  nav,

  common: {
    app: {
      name: "ネロリ's ラボ",
      tagline: '睡眠チーム最適化ツール'
    },
    actions: {
      add: '追加',
      back: '戻る',
      cancel: 'キャンセル',
      close: '閉じる',
      delete: '削除',
      edit: '編集',
      filter: 'フィルター',
      next: '次へ',
      remove: '削除',
      reset: 'リセット',
      save: '保存',
      search: '検索'
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
