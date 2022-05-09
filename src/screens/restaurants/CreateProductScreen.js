import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import { brandBackground, brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import defaultProduct from '../../../assets/product.jpeg'
import { getProductCategories } from '../../api/ProductEndpoints'
import { showMessage } from 'react-native-flash-message'
import DropDownPicker from 'react-native-dropdown-picker'

export default function CreateProductScreen () {
  const [image, setImage] = useState()
  const [open, setOpen] = useState(false)
  const [productCategories, setProductCategories] = useState([])
  const [selectedProductCategory, setSelectedProductCategory] = useState()
  const [isEnabled, setIsEnabled] = useState(true)
  const toggleSwitch = () => setIsEnabled(previousState => !previousState)

  useEffect(() => {
    async function fetchProductCategories () {
      try {
        const fetchedProductCategories = await getProductCategories()
        const fetchedProductCategoriesReshaped = fetchedProductCategories.map((e) => {
          return {
            label: e.name,
            value: e.id
          }
        })
        setProductCategories(fetchedProductCategoriesReshaped)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving product categories. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchProductCategories()
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
            name='price'
            label='Price:'
          />
          <InputItem
            name='order'
            label='Order/position to be rendered:'
          />

          <DropDownPicker
            open={open}
            value={selectedProductCategory}
            items={productCategories}
            setOpen={setOpen}
            onSelectItem={item => {
              setSelectedProductCategory(item.value)
            }}
            setItems={setProductCategories}
            placeholder="Select the product category"
            containerStyle={{ height: 40, marginTop: 20, marginBottom: 20 }}
            style={{ backgroundColor: brandBackground }}
            dropDownStyle={{ backgroundColor: '#fafafa' }}
          />

          <TextRegular>Is it available?</TextRegular>
          <Switch
            trackColor={{ false: brandSecondary, true: brandPrimary }}
            thumbColor={isEnabled ? brandSecondary : '#f4f3f4'}
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
          />

          <Pressable onPress={() =>
            pickImage(
              async result => {
                // await setFieldValue('image', result)
                setImage(result)
              }
            )
          }
            style={styles.imagePicker}
          >
            <TextRegular>Product image: </TextRegular>
            <Image style={styles.image} source={image ? { uri: image.uri } : defaultProduct} />
          </Pressable>

          <Pressable
            onPress={() => console.log('Button pressed') }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? brandPrimaryTap
                  : brandPrimary
              },
              styles.button
            ]}>
            <TextRegular textStyle={styles.text}>
              Create product
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
  },
  switch: {
    marginTop: 5
  }
})
