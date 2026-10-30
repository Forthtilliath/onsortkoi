import { AddButton } from '@forthtilliath/react-native-kit/components/list/AddButton';
import { useMemo, useState } from 'react';

import {
  formatLabel,
  groupByFormat,
  linkGame,
  plural,
  saveSleeve,
  sleevesForGame,
  unlinkGame,
} from '../../domain/sleeves';
import type { Game } from '../../domain/types';
import { Card, CardRow } from '../../ui/CardRow';
import { useKitStyles } from '../../ui/kitStyles';
import { Section } from '../../ui/Section';
import { useSleeves } from '../../useSleeves';
import { LinkEditor } from './LinkEditor';
import { SleeveForm } from './SleeveForm';
import { SleevePicker } from './SleevePicker';

type Step = { kind: 'pick' } | { kind: 'create' } | { kind: 'link'; sleeveId: number; note?: string };

/** Section « Sleeves » de la fiche jeu : produits utilisés, ajout et note de chaque association. */
export function GameSleeves({ game }: { game: Game }) {
  const kit = useKitStyles();
  const { sleeves, change } = useSleeves();
  const [step, setStep] = useState<Step | null>(null);

  const used = useMemo(() => sleevesForGame(sleeves, game.id), [sleeves, game.id]);
  const groups = useMemo(() => groupByFormat(sleeves), [sleeves]);
  const linked = step?.kind === 'link' ? sleeves.find((s) => s.id === step.sleeveId) : undefined;
  const close = () => setStep(null);

  return (
    <Section title="Sleeves" aside={used.length ? String(used.length) : undefined}>
      {used.length > 0 && (
        <Card>
          {used.map(({ sleeve, note }) => (
            <CardRow
              key={sleeve.id}
              title={sleeve.name}
              details={[formatLabel(sleeve), note].filter(Boolean)}
              value={String(sleeve.stock)}
              accessibilityLabel={[sleeve.name, formatLabel(sleeve), note, plural(sleeve.stock, 'restante')]
                .filter(Boolean)
                .join(', ')}
              onPress={() => setStep({ kind: 'link', sleeveId: sleeve.id, note })}
            />
          ))}
        </Card>
      )}
      <AddButton label="+ Ajouter des sleeves" onPress={() => setStep({ kind: 'pick' })} styles={kit.addButton} />

      {step?.kind === 'pick' && (
        <SleevePicker
          gameTitle={game.title}
          gameId={game.id}
          groups={groups}
          onPick={(sleeve) => setStep({ kind: 'link', sleeveId: sleeve.id })}
          onCreate={() => setStep({ kind: 'create' })}
          onClose={close}
        />
      )}
      {step?.kind === 'create' && (
        <SleeveForm
          visible
          formats={groups}
          onSubmit={(draft) => {
            let sleeveId = 0;
            change((list) => {
              const result = saveSleeve(list, draft);
              sleeveId = result.id;
              return result.sleeves;
            });
            // Enchaîne sur l'association au jeu en cours.
            setStep({ kind: 'link', sleeveId });
          }}
          onClose={close}
        />
      )}
      {step?.kind === 'link' && linked && (
        <LinkEditor
          visible
          gameTitle={game.title}
          sleeve={linked}
          initialNote={step.note}
          onSave={(note) => {
            change((list) => linkGame(list, linked.id, game.id, note));
            close();
          }}
          onRemove={() => {
            change((list) => unlinkGame(list, linked.id, game.id));
            close();
          }}
          onClose={close}
        />
      )}
    </Section>
  );
}
