import { useMemo } from 'react';
import { Text } from 'react-native';

import { AddButton } from '@forthtilliath/react-native-kit/components/list/AddButton';

import { type FormatGroup, formatLabel, plural, type Sleeve } from '../../domain/sleeves';
import { Card, CardRow } from '../../ui/CardRow';
import { useKitStyles } from '../../ui/kitStyles';
import { ScreenModal } from '../../ui/ScreenModal';
import { Section } from '../../ui/Section';
import { themedStyles } from '../../ui/theme';

interface Props {
  gameTitle: string;
  gameId: number;
  groups: FormatGroup[];
  onPick: (sleeve: Sleeve) => void;
  onCreate: () => void;
  onClose: () => void;
}

/** Choix des sleeves à associer à un jeu, par format ; celles déjà associées sont masquées. */
export function SleevePicker({ gameTitle, gameId, groups, onPick, onCreate, onClose }: Props) {
  const styles = useStyles();
  const kit = useKitStyles();

  const available = useMemo(
    () =>
      groups
        .map((group) => ({ ...group, sleeves: group.sleeves.filter((s) => !s.games.some((l) => l.gameId === gameId)) }))
        .filter((group) => group.sleeves.length > 0),
    [groups, gameId],
  );

  return (
    <ScreenModal visible onClose={onClose} title="Ajouter des sleeves" subtitle={gameTitle}>
      {available.length === 0 && (
        <Text style={styles.hint}>
          {groups.length === 0
            ? 'Aucune sleeve enregistrée pour l’instant.'
            : 'Toutes tes sleeves sont déjà associées à ce jeu.'}
        </Text>
      )}
      {available.map((group) => (
        <Section key={group.key} title={formatLabel(group)}>
          <Card>
            {group.sleeves.map((sleeve) => (
              <CardRow
                key={sleeve.id}
                title={sleeve.name}
                value={String(sleeve.stock)}
                accessibilityLabel={`${sleeve.name}, ${plural(sleeve.stock, 'restante')}`}
                onPress={() => {
                  onPick(sleeve);
                }}
              />
            ))}
          </Card>
        </Section>
      ))}
      <AddButton label="+ Nouvelles sleeves" onPress={onCreate} styles={kit.addButton} />
    </ScreenModal>
  );
}

const useStyles = themedStyles((c) => ({
  hint: { fontSize: 14, color: c.muted },
}));
