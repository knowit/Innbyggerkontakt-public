import { ValidationType } from '../../../../models';

export const ValidationRules: ValidationType[] = [
  {
    metric: 'type',
    metricValue: 'image/jpeg,image/jpg,image/png,image/gif',
    type: 'error',
    shortMessage: 'Bildet du prøvde å laste opp har feil format',
    longMessage:
      'Formatene som er støttet i e-post er jpeg, jpg, png og gif. Prøv igjen med et bilde i et av disse formatene!',
  },
  {
    metric: 'size',
    metricValue: '1048576',
    check: 'max',
    type: 'warning',
    shortMessage: 'Bildet har for stor filstørrelse',
    longMessage:
      'Vi anbefaler en bredde på bildene fra 500px til 680px for å få best mulig innhold til brukerene både på mobil og desktop. Bildet kan være så langt du vil, men bør ikke overstige en filstørrelse på 1MB. Formatene som er støttet er jpeg, jpg, png og gif.',
    shortWarningMessage: 'Bildet bør ikke overstige en filstørrelse på 1MB.',
  },
  {
    metric: 'width',
    metricValue: '680',
    check: 'max',
    type: 'warning',
    shortMessage: 'Bildet du har lastet opp er veldig bredt.',
    longMessage:
      'Vi anbefaler en bredde på bildene fra 500px til 680px for å få best mulig innhold til brukerene både på mobil og desktop. Bildet kan være så langt du vil, men bør ikke overstige en filstørrelse på 1MB. Formatene som er støttet er jpeg, jpg, png og gif.',
    shortWarningMessage:
      'Vi anbefaler en bredde på bildene fra 500px til 680px for å få best mulig resultat til brukene på mobil og desktop.',
  },
  {
    metric: 'width',
    metricValue: '500',
    check: 'min',
    type: 'warning',
    shortMessage: 'Bildet du har lastet opp er veldig smalt',
    longMessage:
      'Vi anbefaler en bredde på bildene fra 500px til 680px for å få best mulig innhold til brukerene både på mobil og desktop. Bildet kan være så langt du vil, men bør ikke overstige en filstørrelse på 1MB. Formatene som er støttet er jpeg, jpg, png og gif.',
    shortWarningMessage:
      'Vi anbefaler en bredde på bildene fra 500px til 680px for å få best mulig resultat til brukene på mobil og desktop.',
  },
];
