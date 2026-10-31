import { useState } from 'react';
import { Text, View } from 'react-native';

import { showToast } from '@forthtilliath/react-native-kit/components/feedback/toast';
import { successFeedback } from '@forthtilliath/react-native-kit/utils/helpers/haptics';

import { parseCount, plural } from '../../domain/sleeves';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { TextField } from '../../ui/TextField';
import { radius, spacing, themedStyles } from '../../ui/theme';

interface Props {
  stock: number;
  /** Ajoute `delta` au stock (négatif pour en retirer). */
  onAdjust: (delta: number) => void;
}

/** Stock restant, et ajout ou retrait d'une quantité : sleeves achetées ou posées sur des cartes. */
export function StockAdjuster({ stock, onAdjust }: Props) {
  const styles = useStyles();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);

  const apply = (sign: 1 | -1) => {
    const count = parseCount(quantity);
    if (!count) {
      setError('Indique un nombre de sleeves.');
      return;
    }
    setError(null);
    setQuantity('');
    onAdjust(sign * count);
    successFeedback();
    const removed = Math.min(count, stock);
    showToast(
      sign > 0
        ? `${plural(count, 'sleeve')} ajoutée${count > 1 ? 's' : ''} au stock.`
        : `${plural(removed, 'sleeve')} retirée${removed > 1 ? 's' : ''} du stock.`,
    );
  };

  return (
    <View style={styles.card}>
      <View
        style={styles.stock}
        accessible
        accessibilityLabel={`${plural(stock, 'sleeve')} restante${stock > 1 ? 's' : ''}`}
      >
        <Text style={styles.count}>{stock}</Text>
        <Text style={styles.unit}>restante{stock > 1 ? 's' : ''}</Text>
      </View>
      <TextField
        label="Quantité"
        value={quantity}
        onChangeText={setQuantity}
        placeholder="ex. 50"
        keyboardType="number-pad"
        maxLength={5}
        error={error}
      />
      <View style={styles.buttons}>
        <View style={styles.button}>
          <PrimaryButton
            label="Utilisées"
            icon="remove"
            onPress={() => {
              apply(-1);
            }}
            outline
          />
        </View>
        <View style={styles.button}>
          <PrimaryButton
            label="Achetées"
            icon="add"
            onPress={() => {
              apply(1);
            }}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: c.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  stock: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  count: { fontSize: 36, fontWeight: '800', color: c.text },
  unit: { fontSize: 16, color: c.muted },
  buttons: { flexDirection: 'row', gap: spacing.md },
  button: { flex: 1 },
}));
