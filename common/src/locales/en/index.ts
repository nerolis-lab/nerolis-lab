import { default as homepage } from './files/homepage';
import { default as profilepage } from './files/profilepage';
import { default as nav } from './files/nav';

export const en = {
  homepage,
  profilepage,
  nav,

  common: {
    app: {
      name: "Neroli's Lab",
      tagline: 'Sleep Team Optimizer'
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      search: 'Search',
      filter: 'Filter',
      reset: 'Reset',
      close: 'Close',
      back: 'Back',
      next: 'Next'
    },
    status: {
      loading: 'Loading...',
      saving: 'Saving...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning'
    },
    language: {
      title: 'Language'
    }
  }
};

export type Translation = typeof en;
