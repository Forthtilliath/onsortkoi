import { matchesDurations } from '../durations';

const range = (min: number, max: number | null) => ({ min, max });

describe('matchesDurations', () => {
  it('accepte tout sans tranche choisie', () => {
    expect(matchesDurations(null, [])).toBe(true);
  });

  it('écarte les jeux sans durée dès qu’une tranche est choisie', () => {
    expect(matchesDurations(null, ['express'])).toBe(false);
  });

  it('range une borne exacte dans la tranche du dessous', () => {
    expect(matchesDurations(range(30, 30), ['express'])).toBe(true);
    expect(matchesDurations(range(30, 30), ['short'])).toBe(false);
    expect(matchesDurations(range(60, 60), ['short'])).toBe(true);
    expect(matchesDurations(range(60, 60), ['medium'])).toBe(false);
  });

  it('retient un jeu dans toutes les tranches que sa durée chevauche', () => {
    expect(matchesDurations(range(45, 90), ['short'])).toBe(true);
    expect(matchesDurations(range(45, 90), ['medium'])).toBe(true);
    expect(matchesDurations(range(45, 90), ['express'])).toBe(false);
    expect(matchesDurations(range(45, 90), ['long'])).toBe(false);
  });

  it('traite « 120+ » comme une partie longue', () => {
    expect(matchesDurations(range(120, null), ['long'])).toBe(true);
    expect(matchesDurations(range(120, null), ['medium'])).toBe(true);
    expect(matchesDurations(range(150, null), ['medium'])).toBe(false);
  });

  it('combine plusieurs tranches en OU', () => {
    expect(matchesDurations(range(15, 15), ['express', 'long'])).toBe(true);
    expect(matchesDurations(range(180, 180), ['express', 'long'])).toBe(true);
    expect(matchesDurations(range(90, 90), ['express', 'long'])).toBe(false);
  });
});
