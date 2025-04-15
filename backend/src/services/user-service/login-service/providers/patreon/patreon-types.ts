export type PatronStatus = 'active_patron' | 'former_patron' | 'declined_patron';

export type Patron = {
  id: string;
  patronStatus: PatronStatus | null;
  pledgeRelationshipStart: string | null;
};
