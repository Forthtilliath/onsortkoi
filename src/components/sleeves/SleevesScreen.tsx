import { AddButton } from '@forthtilliath/react-native-kit/components/list/AddButton';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { formatLabel, groupByFormat, plural, saveSleeve } from '../../domain/sleeves';
import type { Game } from '../../domain/types';
import { Card, CardRow } from '../../ui/CardRow';
import { useKitStyles } from '../../ui/kitStyles';
import { ScreenModal } from '../../ui/ScreenModal';
import { Section } from '../../ui/Section';
import { themedStyles } from '../../ui/theme';
import { useSleeves } from '../../useSleeves';
import { SleeveDetail } from './SleeveDetail';
import { SleeveForm } from './SleeveForm';

type Props = {
  visible: boolean;
  games: Game[];
  onClose: () => void;
};

/** Stock de sleeves par format de carte, toutes marques confondues, puis produit par produit. */
export function SleevesScreen({ visible, games, onClose }: Props) {
  const styles = useStyles();
  const kit = useKitStyles();
  const { sleeves, change } = useSleeves();
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const groups = useMemo(() => groupByFormat(sleeves), [sleeves]);
  const opened = sleeves.find((s) => s.id === openId);

  return (
    <ScreenModal visible={visible} onClose={onClose} title="Mes sleeves">
      {groups.length === 0 && (
        <Text style={styles.hint}>
          Ajoute tes sleeves (une entrée par marque ou couleur) avec leur format et le nombre qu’il te reste. Tu verras
          ici le stock de chaque format, et pourras noter quels jeux les utilisent.
        </Text>
      )}

      {groups.map((group) => (
        <Section
          key={group.key}
          title={formatLabel(group)}
          aside={group.sleeves.length > 1 ? `${plural(group.stock, 'restante')} au total` : undefined}
        >
          <Card>
            {group.sleeves.map((sleeve) => (
              <CardRow
                key={sleeve.id}
                title={sleeve.name}
                details={[sleeve.games.length ? plural(sleeve.games.length, 'jeu', 'jeux') : 'Aucun jeu']}
                value={String(sleeve.stock)}
                accessibilityLabel={`${sleeve.name}, ${plural(sleeve.stock, 'restante')}, ${plural(sleeve.games.length, 'jeu', 'jeux')}`}
                onPress={() => setOpenId(sleeve.id)}
              />
            ))}
          </Card>
        </Section>
      ))}

      <AddButton label="+ Ajouter des sleeves" onPress={() => setCreating(true)} styles={kit.addButton} />

      {creating && (
        <SleeveForm
          visible
          formats={groups}
          onSubmit={(draft) => {
            let id = 0;
            change((list) => {
              const result = saveSleeve(list, draft);
              id = result.id;
              return result.sleeves;
            });
            setCreating(false);
            // Enchaîne sur la fiche du produit, pour y associer ses jeux.
            setOpenId(id);
          }}
          onClose={() => setCreating(false)}
        />
      )}
      {opened && <SleeveDetail sleeve={opened} games={games} formats={groups} onClose={() => setOpenId(null)} />}
    </ScreenModal>
  );
}

const useStyles = themedStyles((c) => ({
  hint: { fontSize: 14, color: c.muted, lineHeight: 20 },
}));
