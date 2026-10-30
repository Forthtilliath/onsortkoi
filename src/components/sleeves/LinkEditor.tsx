import { useState } from 'react';
import { Text } from 'react-native';

import { confirmDestructive } from '@forthtilliath/react-native-kit/utils/helpers/confirmDestructive';

import { formatLabel, MAX_NOTE_LENGTH, plural, type Sleeve } from '../../domain/sleeves';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { ScreenModal } from '../../ui/ScreenModal';
import { TextField } from '../../ui/TextField';
import { themedStyles } from '../../ui/theme';

interface Props {
  visible: boolean;
  gameTitle: string;
  sleeve: Sleeve;
  /** Note de l'association existante ; absente pour en créer une. */
  initialNote?: string;
  onSave: (note: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

/** Association d'un jeu à un produit de sleeves, avec une note libre. */
export function LinkEditor({ visible, gameTitle, sleeve, initialNote, onSave, onRemove, onClose }: Props) {
  const styles = useStyles();
  const [note, setNote] = useState(initialNote ?? '');
  const isNew = initialNote === undefined;

  const remove = () => {
    confirmDestructive('Retirer ce jeu ?', onRemove, {
      message: `${gameTitle} ne sera plus associé à « ${sleeve.name} ». Le stock ne change pas.`,
      confirmLabel: 'Retirer',
    });
  };

  return (
    <ScreenModal
      visible={visible}
      onClose={onClose}
      title={gameTitle}
      subtitle={`${sleeve.name} · ${formatLabel(sleeve)} · ${plural(sleeve.stock, 'restante')}`}
      action={{
        label: isNew ? 'Associer' : 'Enregistrer',
        onPress: () => {
          onSave(note);
        },
      }}
    >
      <TextField
        label="Note (facultative)"
        value={note}
        onChangeText={setNote}
        placeholder="ex. jaune : deck du joueur 1"
        maxLength={MAX_NOTE_LENGTH}
        autoFocus={isNew}
        returnKeyType="done"
        onSubmitEditing={() => {
          onSave(note);
        }}
      />
      <Text style={styles.hint}>
        Pour quelles cartes de ce jeu ? Utile pour reprendre les mêmes sleeves avec une extension.
      </Text>
      {!isNew && <PrimaryButton label="Retirer ce jeu de ces sleeves" icon="unlink-outline" onPress={remove} outline />}
    </ScreenModal>
  );
}

const useStyles = themedStyles((c) => ({
  hint: { fontSize: 13, color: c.muted, marginTop: -12 },
}));
