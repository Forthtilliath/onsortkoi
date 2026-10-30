import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  type FormatGroup,
  formatLabel,
  MAX_NAME_LENGTH,
  MAX_SIDE,
  MIN_SIDE,
  parseCount,
  parseMillimeters,
  type Sleeve,
  type SleeveDraft,
} from '../../domain/sleeves';
import { ScreenModal } from '../../ui/ScreenModal';
import { Section } from '../../ui/Section';
import { TextField } from '../../ui/TextField';
import { radius, spacing, themedStyles } from '../../ui/theme';

interface Props {
  visible: boolean;
  /** Produit modifié ; absent pour en créer un. */
  initial?: Sleeve;
  /** Formats déjà utilisés, proposés en raccourci. */
  formats: FormatGroup[];
  onSubmit: (draft: SleeveDraft) => void;
  onClose: () => void;
}

type Errors = Partial<Record<'name' | 'width' | 'height' | 'stock', string>>;

const mmText = (value: number | undefined) => (value === undefined ? '' : String(value).replace('.', ','));
const SIDE_ERROR = `Entre ${MIN_SIDE} et ${MAX_SIDE} mm, au dixième près (ex. 63,5).`;

/** Saisie d'un produit de sleeves : nom, format et stock restant. */
export function SleeveForm({ visible, initial, formats, onSubmit, onClose }: Props) {
  const styles = useStyles();
  const [name, setName] = useState(initial?.name ?? '');
  const [width, setWidth] = useState(() => mmText(initial?.width));
  const [height, setHeight] = useState(() => mmText(initial?.height));
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    const draft = {
      name: name.trim(),
      width: parseMillimeters(width),
      height: parseMillimeters(height),
      stock: stock.trim() === '' ? 0 : parseCount(stock),
    };
    const next: Errors = {
      name: draft.name ? undefined : 'Donne un nom à ces sleeves (marque, couleur…).',
      width: draft.width === null ? SIDE_ERROR : undefined,
      height: draft.height === null ? SIDE_ERROR : undefined,
      stock: draft.stock === null ? 'Un nombre entier, sans décimale.' : undefined,
    };
    setErrors(next);
    if (draft.width === null || draft.height === null || draft.stock === null || !draft.name) return;
    onSubmit({ name: draft.name, width: draft.width, height: draft.height, stock: draft.stock });
  };

  return (
    <ScreenModal
      visible={visible}
      onClose={onClose}
      title={initial ? 'Modifier les sleeves' : 'Nouvelles sleeves'}
      action={{ label: 'Enregistrer', onPress: submit }}
    >
      <TextField
        label="Nom"
        value={name}
        onChangeText={setName}
        placeholder="ex. Mayday Premium fond jaune"
        maxLength={MAX_NAME_LENGTH}
        autoFocus={!initial}
        error={errors.name}
      />

      <Section title="Format de carte (mm)">
        <View style={styles.sides}>
          <TextField
            compact
            label="Largeur"
            value={width}
            onChangeText={setWidth}
            placeholder="63,5"
            keyboardType="decimal-pad"
            maxLength={5}
            error={errors.width}
          />
          <TextField
            compact
            label="Hauteur"
            value={height}
            onChangeText={setHeight}
            placeholder="88"
            keyboardType="decimal-pad"
            maxLength={5}
            error={errors.height}
          />
        </View>
        {formats.length > 0 && (
          <View style={styles.formats}>
            {formats.map((format) => (
              <Pressable
                key={format.key}
                onPress={() => {
                  setWidth(mmText(format.width));
                  setHeight(mmText(format.height));
                }}
                accessibilityRole="button"
                accessibilityHint="Remplit la largeur et la hauteur"
                style={({ pressed }) => [styles.format, pressed && styles.pressed]}
              >
                <Text style={styles.formatLabel}>{formatLabel(format)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Section>

      <TextField
        label="Stock restant"
        value={stock}
        onChangeText={setStock}
        placeholder="0"
        keyboardType="number-pad"
        maxLength={5}
        error={errors.stock}
      />
    </ScreenModal>
  );
}

const useStyles = themedStyles((c) => ({
  sides: { flexDirection: 'row', gap: spacing.md },
  formats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  format: {
    backgroundColor: c.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  pressed: { opacity: 0.6 },
  formatLabel: { fontSize: 13, color: c.primary },
}));
