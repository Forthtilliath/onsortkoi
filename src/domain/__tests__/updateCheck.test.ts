import { EMPTY_UPDATE_CHECK, parseUpdateCheck } from '../updateCheck';

describe('parseUpdateCheck', () => {
  it('relit un suivi valide et retire les clés inconnues', () => {
    const raw = JSON.stringify({ lastCheckedAt: 1_760_000_000_000, dismissedVersion: '1.2.0', extra: true });
    expect(parseUpdateCheck(raw)).toEqual({ lastCheckedAt: 1_760_000_000_000, dismissedVersion: '1.2.0' });
  });

  it('repart de zéro sans donnée, ou si elle est corrompue', () => {
    expect(parseUpdateCheck(null)).toEqual(EMPTY_UPDATE_CHECK);
    expect(parseUpdateCheck('{pas du json')).toEqual(EMPTY_UPDATE_CHECK);
    expect(parseUpdateCheck(JSON.stringify({ lastCheckedAt: -1, dismissedVersion: null }))).toEqual(
      EMPTY_UPDATE_CHECK,
    );
  });

  it("refuse une version ignorée qui n'en est pas une", () => {
    const raw = JSON.stringify({ lastCheckedAt: null, dismissedVersion: '<script>' });
    expect(parseUpdateCheck(raw)).toEqual(EMPTY_UPDATE_CHECK);
  });
});
