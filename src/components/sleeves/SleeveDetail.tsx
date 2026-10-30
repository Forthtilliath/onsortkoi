import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { AddButton } from '@forthtilliath/react-native-kit/components/list/AddButton';
import { confirmDestructive } from '@forthtilliath/react-native-kit/utils/helpers/confirmDestructive';

import { compareText } from '../../domain/filters';
import {
  adjustStock,
  type FormatGroup,
  formatLabel,
  linkGame,
  plural,
  removeSleeve,
  saveSleeve,
  type Sleeve,
  unlinkGame,
} from '../../domain/sleeves';
import type { Game } from '../../domain/types';
import { Card, CardRow } from '../../ui/CardRow';
import { useKitStyles } from '../../ui/kitStyles';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { ScreenModal } from '../../ui/ScreenModal';
import { Section } from '../../ui/Section';
import { themedStyles } from '../../ui/theme';
import { useSleeves } from '../../useSleeves';

import { GamePicker } from './GamePicker';
import { LinkEditor } from './LinkEditor';
import { SleeveForm } from './SleeveForm';
import { StockAdjuster } from './StockAdjuster';

interface Props {
  sleeve: Sleeve;
  games: Game[];
  formats: FormatGroup[];
  onClose: () => void;
}

interface Editing {
  gameId: number;
  title: string;
  note?: string;
}

/** Absent de la collection après un réimport MyLudo : l'association est gardée, à retirer à la main. */
const missingTitle = 'Jeu absent de la collection';

/** Fiche d'un produit de sleeves : stock, jeux qui l'utilisent, modification et suppression. */
export function SleeveDetail({ sleeve, games, formats, onClose }: Props) {
  const styles = useStyles();
  const kit = useKitStyles();
  const { change } = useSleeves();
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [editingSleeve, setEditingSleeve] = useState(false);

  const gamesById = useMemo(() => new Map(games.map((g) => [g.id, g])), [games]);
  const links = useMemo(
    () =>
      sleeve.games
        .map((link) => ({ ...link, title: gamesById.get(link.gameId)?.title ?? missingTitle }))
        .sort((a, b) => compareText(a.title, b.title)),
    [sleeve.games, gamesById],
  );
  const linkedIds = useMemo(() => new Set(sleeve.games.map((l) => l.gameId)), [sleeve.games]);

  const remove = () => {
    confirmDestructive(
      'Supprimer ces sleeves ?',
      () => {
        change((list) => removeSleeve(list, sleeve.id));
        onClose();
      },
      {
        message: `« ${sleeve.name} » et ses ${plural(sleeve.games.length, 'association')} seront supprimés.`,
        confirmLabel: 'Supprimer',
      },
    );
  };

  return (
    <ScreenModal visible onClose={onClose} title={sleeve.name} subtitle={formatLabel(sleeve)}>
      <StockAdjuster
        stock={sleeve.stock}
        onAdjust={(delta) => {
          change((list) => adjustStock(list, sleeve.id, delta));
        }}
      />

      <Section title="Jeux qui les utilisent" aside={links.length ? String(links.length) : undefined}>
        {links.length > 0 ? (
          <Card>
            {links.map((link) => (
              <CardRow
                key={link.gameId}
                title={link.title}
                details={[link.title === missingTitle ? `Identifiant MyLudo ${link.gameId}` : '', link.note].filter(
                  Boolean,
                )}
                onPress={() => {
                  setEditing(link);
                }}
              />
            ))}
          </Card>
        ) : (
          <Text style={styles.hint}>Aucun jeu pour l’instant.</Text>
        )}
        <AddButton
          label="+ Associer un jeu"
          onPress={() => {
            setPicking(true);
          }}
          styles={kit.addButton}
        />
      </Section>

      <PrimaryButton
        label="Modifier le nom, le format ou le stock"
        icon="create-outline"
        onPress={() => {
          setEditingSleeve(true);
        }}
        outline
      />
      <PrimaryButton label="Supprimer ces sleeves" icon="trash-outline" onPress={remove} outline />

      {picking && (
        <GamePicker
          visible
          games={games}
          exclude={linkedIds}
          onPick={(game) => {
            setPicking(false);
            setEditing({ gameId: game.id, title: game.title });
          }}
          onClose={() => {
            setPicking(false);
          }}
        />
      )}
      {editing && (
        <LinkEditor
          visible
          gameTitle={editing.title}
          sleeve={sleeve}
          initialNote={editing.note}
          onSave={(note) => {
            change((list) => linkGame(list, sleeve.id, editing.gameId, note));
            setEditing(null);
          }}
          onRemove={() => {
            change((list) => unlinkGame(list, sleeve.id, editing.gameId));
            setEditing(null);
          }}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
      {editingSleeve && (
        <SleeveForm
          visible
          initial={sleeve}
          formats={formats}
          onSubmit={(draft) => {
            change((list) => saveSleeve(list, draft, sleeve.id).sleeves);
            setEditingSleeve(false);
          }}
          onClose={() => {
            setEditingSleeve(false);
          }}
        />
      )}
    </ScreenModal>
  );
}

const useStyles = themedStyles((c) => ({
  hint: { fontSize: 14, color: c.muted },
}));
