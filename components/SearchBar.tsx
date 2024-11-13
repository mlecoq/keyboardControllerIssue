import {useCallback, useRef} from 'react';
import {Pressable, TextInput, View, useColorScheme} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  // withTiming,
} from 'react-native-reanimated';
import {
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
} from 'react-native';

type SearchBarProps = {
  containerStyle?: StyleProp<ViewStyle>;
  onCancel?: () => void;
  onChangeText: (text?: string) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  animationDuration?: number; // not used right now - withTiming freezes on android
  value?: string;
  autoFocus?: boolean;
};

const SearchBar = ({
  containerStyle,
  onFocus,
  onBlur,
  onCancel,
  onChangeText,
  onSubmitEditing,
  placeholder,
  value,
  autoFocus,
}: //animationDuration = 300,
SearchBarProps) => {
  const textInputRef = useRef<TextInput>(null);

  const onPressClear = useCallback(() => {
    onChangeText(undefined);
  }, [onChangeText]);

  const onPressCancel = useCallback(() => {
    onChangeText(undefined);
    if (onCancel) {
      onCancel();
    }
    textInputRef.current?.blur();
  }, [onCancel, onChangeText]);

  const containerWidth = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      containerWidth.value = e.nativeEvent.layout.width;
    },
    [containerWidth],
  );

  //button width depends on the length of the text(i18n)
  const cancelButtonWidth = useSharedValue(0);
  const onButtonLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (!cancelButtonWidth.value) {
        cancelButtonWidth.value = e.nativeEvent.layout.width;
      }
    },
    [cancelButtonWidth],
  );

  const focus = useCallback((event: GestureResponderEvent) => {
    event.preventDefault();
    textInputRef.current?.focus();
  }, []);

  const isFocused = useSharedValue(0);

  const onInputFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      onFocus?.(e);
      isFocused.value = withTiming(1, {duration: 300}); // freezes on android
      // isFocused.value = 1;
    },
    [isFocused, onFocus],
  );

  const onInputBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      onBlur?.(e);
      isFocused.value = withTiming(0, {duration: 300}); // freezes on android
      //isFocused.value = 0;
    },
    [isFocused, onBlur],
  );

  const colorScheme = useColorScheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        isFocused.value,
        [0, 1],
        [containerWidth.value, containerWidth.value - cancelButtonWidth.value - MARGIN_LEFT_BUTTON],
      ),
      borderWidth: isFocused.value,
      borderColor: interpolateColor(isFocused.value, [0, 1], ['#fffffe', '#fff000']),
    };
  });

  const wrapperStyle = useAnimatedStyle(() => {
    return {
      opacity: containerWidth.value ? 1 : 0,
    };
  }, [containerWidth]);

  return (
    <View style={containerStyle}>
      <View testID="SearchBar__container-view" style={styles.container} onLayout={onLayout}>
        <Animated.View style={[styles.wrapper, wrapperStyle]}>
          <Animated.View
            testID="SearchBar__view-inputcontainer"
            style={[styles.innerSearchBarView, animatedStyle]}
            onTouchStart={focus}
          >
            <TextInput
              testID="searchbar__textInput"
              accessibilityLabel={'Enter your search word'}
              placeholder={placeholder}
              ref={textInputRef}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              style={styles.input}
              defaultValue={value}
              onChangeText={onChangeText}
              selectionColor={'red'}
              returnKeyType="search"
              onSubmitEditing={onSubmitEditing}
              autoFocus={autoFocus}
              placeholderTextColor={styles.placeHolder.color}
            />
            {value ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={'Tap to clear your search'}
                onPress={onPressClear}
                testID="SearchBar__clear-button"
                style={styles.cancelPressable}
              >
                x
              </Pressable>
            ) : null}
          </Animated.View>

          <Pressable
            accessibilityLabel={'Tap to cancel your search'}
            testID="SearchBar__cancel-button"
            onLayout={onButtonLayout}
            onPress={onPressCancel}
            style={{
              borderColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderRadius: 12,
              padding: 10,
            }}
          >
            <Text>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

export default SearchBar;
const MARGIN_LEFT_BUTTON = 10;

const styles = StyleSheet.create({
  innerSearchBarView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'grey',
    borderRadius: 12,
    fontSize: 16,
    color: 'black',
  },
  input: {
    flex: 1,
    height: 46,
    color: 'black',
  },
  placeHolder: {
    color: 'grey',
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    columnGap: 10,
  },
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    width: '100%', //important for animation,to be based on the maxWith of the parent
  },
  clearIcon: {
    width: 15,
    height: 15,
    marginLeft: 16,
    marginRight: 11,
  },
  lensIcon: {
    marginLeft: 16,
    marginRight: 11,
    tintColor: 'grey',
  },
  lensIconFocuses: {
    tintColor: 'white',
  },
  cancelPressable: {
    paddingRight: 10,
    marginLeft: 10,
  },
  cancelIcon: {
    padding: 1,
    tintColor: 'grey',
  },
});
