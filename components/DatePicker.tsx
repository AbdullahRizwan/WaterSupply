import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  displayFormat?: 'iso' | 'local';
  minimumDate?: Date;
  maximumDate?: Date;
};

export default function DatePicker({
  value,
  onChange,
  mode = 'date',
  displayFormat = 'local',
  minimumDate,
  maximumDate,
}: Props) {
  const [show, setShow] = useState(false);

  const handleChange = (_event: any, selectedDate?: Date) => {
    // On Android selectedDate is undefined when dismissed
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatted =
    displayFormat === 'iso'
      ? value.toISOString().split('T')[0]
      : value.toLocaleDateString();

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.text}>{formatted}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode === 'datetime' ? 'date' : mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 16,
    color: '#222',
  },
});
