/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'

import DropDownPicker from 'react-native-dropdown-picker'
import { getRestaurantCategories } from '../../api/RestaurantEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import { brandBackground, brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import restaurantBackground from '../../../assets/restaurantBackground.jpeg'
import { showMessage } from 'react-native-flash-message'

export default function CreateRestaurantScreen () {
  const [logo, setLogo] = useState()
  const [heroImage, setHeroImage] = useState()
  const [open, setOpen] = useState(false)
  const [restaurantCategories, setRestaurantCategories] = useState([])
  const [selectedRestaurantCategory, setSelectedRestaurantCategory] = useState()

  useEffect(() => {
    async function fetchRestaurantCategories () {
      try {
        const fetchedRestaurantCategories = await getRestaurantCategories()
        const fetchedRestaurantCategoriesReshaped = fetchedRestaurantCategories.map((e) => {
          return {
            label: e.name,
            value: e.id
          }
        })
        setRestaurantCategories(fetchedRestaurantCategoriesReshaped)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurant categories. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchRestaurantCategories()
  }, [])

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
      }
    })()
  }, [])

  const pickImage = async (onSuccess) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.cancelled) {
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }

  return (
    <ScrollView>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: '60%' }}>
          <InputItem
            name='name'
            label='Name:'
          />
          <InputItem
            name='description'
            label='Description:'
          />
          <InputItem
            name='address'
            label='Address:'
          />
          <InputItem
            name='postalCode'
            label='Postal code:'
          />
          <InputItem
            name='url'
            label='Url:'
          />
          <InputItem
            name='shippingCosts'
            label='Shipping costs:'
          />
          <InputItem
            name='email'
            label='Email:'
          />
          <InputItem
            name='phone'
            label='Phone:'
          />

          <DropDownPicker
            open={open}
            value={selectedRestaurantCategory}
            items={restaurantCategories}
            setOpen={setOpen}
            onSelectItem={item => {
              setSelectedRestaurantCategory(item.value)
            }}
            setItems={setRestaurantCategories}
            placeholder="Select the restaurant category"
            containerStyle={{ height: 40, marginTop: 20 }}
            style={{ backgroundColor: brandBackground }}
            dropDownStyle={{ backgroundColor: '#fafafa' }}
          />

          <Pressable onPress={() =>
            pickImage(
              async result => {
                setLogo(result)
              }
            )
          }
            style={styles.imagePicker}
          >
            <TextRegular>Logo: </TextRegular>
            <Image style={styles.image} source={logo ? { uri: logo.uri } : restaurantLogo} />
          </Pressable>

          <Pressable onPress={() =>
            pickImage(
              async result => {
                // await setFieldValue('heroImage', result)
                setHeroImage(result)
              }
            )
          }
            style={styles.imagePicker}
          >
            <TextRegular>Hero image: </TextRegular>
            <Image style={styles.image} source={heroImage ? { uri: heroImage.uri } : restaurantBackground} />
          </Pressable>

          <Pressable
            onPress={() => console.log('Submit pressed')}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? brandPrimaryTap
                  : brandPrimary
              },
              styles.button
            ]}>
            <TextRegular textStyle={styles.text}>
              Create restaurant
            </TextRegular>
          </Pressable>
        </View>
      </View>
    </ScrollView>

  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center'
  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  }
})
