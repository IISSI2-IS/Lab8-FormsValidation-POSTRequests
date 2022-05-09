# Introduction
During this lab first, we will learn how to validate forms with formik and yup. Secondly, we will learn how to perform POST requests to the backend.

# 0. Setup
Clone template repository and download your copy. Once you should setup your .env file so API_BASE_URL points to your server. For instance `API_BASE_URL=http://localhost:3000`.

You have to run the backend server as well. Go to your backend project folder and run `npm install` (if needed) and `npm start`. You may need to execute database migrations and seeders.

You can then run `npm install` and `npm start`. Check that the base project is working.

It is important to notice that this base project includes:
* Previous labs solved, including creating restaurant and products forms (lacks from performing validation and requests to backend)
* Needed packages for validate forms, Formik and yup, added to package.json

Keep in mind that to make some API requests, it is needed to be logged-in. So confirm that you can log-in with some owner user. The provided user-seeder at the backend creates an owner with the following credentials:

email: owner1@owner.com
password: secret
Once the user is logged in, the bearer token is used in every request.

# 1. CreateRestaurant Form validation.
Forms have to be validated at front-end before submission is done to backend. Validation should check if the filled data matches the requirements set in the various form inputs. For instance: an input for email should contain a valid email, or password should have a minimum size, or some input is required.

To this end, we will use the most popular package for validation in React and React Native projects named Formik. See the general docs for Formik React https://formik.org/docs/overview and the guide for using it in React-native https://formik.org/docs/guides/react-native.

Validation rules could be handwritten or we can use another package. Formik recommend using Yup package for schema validation rules. These can include various rules such as: required, email, strings, numbers, dates or default values. See documentation of Yup package https://github.com/jquense/yup.

We will include the validation for the `CreateRestaurantScreen` form by following these steps:
1. Import formik and yup
```Javascript
import { ErrorMessage, Formik } from 'formik'
import * as yup from 'yup'
````

2. Define a new const variable for declaring initial values for the Restaurant to be created. Remember that these names has to match the ones that the backend expects:
```Javascript
const initialRestaurantValues = { name: '', description: '', address: '', postalCode: '', url: '', shippingCosts: 0, email: '', phone: '', restaurantCategoryId: '' }

```
3. Define a new validationSchema object. It will be used by Formik to check validity of the fields. You can use the following code snippet.
```Javascript
const validationSchema = yup.object().shape({
    name: yup
      .string()
      .max(30, 'Name too long')
      .required('Name is required'),
    address: yup
      .string()
      .max(75, 'Address too long')
      .required('Address is required'),
    postalCode: yup
      .string()
      .max(15, 'Postal code too long')
      .required('Postal code is required'),
    url: yup
      .string()
      .url('Please enter a valid url'),
    shippingCosts: yup
      .number()
      .positive('Please provide a valid shipping cost value')
      .required('Shipping costs value is required'),
    email: yup
      .string()
      .email('Please enter a valid email')
      .required('Email Address is Required'),
    phone: yup
      .string()
      .min(9, ({ min }) => `Phone must be at least ${min} characters`)
      .required('Phone is required'),
    restaurantCategoryId: yup
      .number()
      .required('Restaurant category is required')
      .positive()
      .integer()
  })
```
Notice that:
  * There should be a property named after each of the form inputs that needs validation.
  * Rules defined above include: a type of data that is expected (string, or number for instance), the length of strings, if a number can be negative or not, and if an input is required .
  * If the field does not follow any of these rules, the message passed to each rule should be shown to the user. For instance, if the shippingCosts is not a positive number, the message _Please provide a valid shipping cost value_ will be shown.

4. Now **we have to nest our form inside a `Formik` component**. Add the following:
```Javascript
<Formik
  validationSchema={validationSchema}
  initialValues={initialRestaurantValues}
  onSubmit={createRestaurant}>
  {({ handleSubmit, setFieldValue, values }) => (
    <ScrollView>
      /* Your views, form inputs, submit button/pressable */
    </ScrollView>
  )}
</Formik>
```
It is important to understand how the Formik component works. The Formik component is in charge of handling the form values, validation, errors and submission. To this end we have to define the following properties:
* `validationSchema`: the validation rules, usually a yup object.
* `initialValues`: initialValues given to the form.
* `onSubmit`: the function to be called when the form values pass the validation. Usually we will call a function that will be in charge of preparing the data and using a creation endpoint for the entity. We will learn hoy to POST data to the backend later. At this moment we will just print the values in console.
```Javascript
const createRestaurant = async (values) => {
   console.log(values)
}
```
* `handleSubmit`: is the function that triggers the validation. It has to be called when the user presses the submission button.
* `values`: is the array of elements that represents the state of the form.
* `setFieldValue`: sometimes we will have to manually handle the storage of field values. This is a function that receives as first parameter the name of the field, and the value as second parameter. It will be needed for non standard inputItems such as imagepickers or select controls.

5. We need to modify the behaviour of some components so they use the values array handled by Formik.

    5.1. Modify the DropDownPicker so the following properties are defined as:
```Javascript
value={values.restaurantCategoryId}
onSelectItem={ item => {setFieldValue('restaurantCategoryId', item.value)}}
```
   5.2. Add the following <ErrorMessage> component following the dropdown picker:
```Javascript
<ErrorMessage name={'restaurantCategoryId'} render={msg => <TextError>{msg}</TextError> }/>
```
5.3. Modify the Imagepickers as follows:
```Javascript
<Pressable onPress={() =>
  pickImage(
    async result => {
      await setFieldValue('logo', result)
    }
  )
}
  style={styles.imagePicker}
>
  <TextRegular>Logo: </TextRegular>
  <Image style={styles.image} source={values.logo ? { uri: values.logo.uri } : restaurantLogo} />
</Pressable>
```
and apply similar modification to the heroImage ImagePicker.

6. Next, we need to modify the `<Pressable>` component to call the handleSubmit method. Modify the onPress handler definition: `onPress={handleSubmit}`

Finally, check that the validation now works and shows users validation broken rules defined. Notice that these errors are handled and rendered in the `InputItem` component provided.

Fill the form with valid values and check if they are printed in the console when pressing the Create Restaurant button.

# 2. POST Request to create a restaurant.
Backend provides a POST endpoint to create a restaurant. Notice that handling of images and files is already solved at frontend and backend in various provided artifacts. You can follow these steps:

1. Add new endpoint
In order to create a restaurant, we have to perform a POST request to `/restaurants`. `ApiRequestHelper` includes a post function that help us with this, we just need to provide the route and the data to be posted. To this end, include the following at the `RestaurantEndpoints.js` file:
```Javascript
function create (data) {
  return post('restaurants', data)
}
```
Remember to export the function as well.

2. Implement createRestaurant function at `CreateRestaurantScreen.js` file.
In the previous exercise we just printed the values in the console. Now we need to make the API POST request. To this end keep in mind that:
* Errors can occur at backend, so we need to handle the backend response to check if some errors ocurred.
* I/O operations can freeze the interface so we need to handle with promises. The cleanest way of doing so is to declare the function `async` and using `await` when calling to the API.
* Once the restaurant is created we may navigate to the `RestaurantScreen`. You will need to declare the {route} param at the component level, and you will need to navigate including some information, so the RestaurantScreen will refresh the restaurant list (so the newly created restaurant will appear).

To address these issues, we propose the following code snippet:
```Javascript
const createRestaurant = async (values) => {
  setBackendErrors([])
  try {
    console.log(values)
    const createdRestaurant = await create(values)
    showMessage({
      message: `Restaurant ${createdRestaurant.name} succesfully created`,
      type: 'success',
      style: flashStyle,
      titleStyle: flashTextStyle
    })
    navigation.navigate('RestaurantsScreen', { dirty: true })
  } catch (error) {
    console.log(error)
    setBackendErrors(error.errors)
  }
}
```

You will need to add a backendErrors state variable:
```Javascript
const [backendErrors, setBackendErrors] = useState()
```

And finally, we will need to show backendErrors if present. To do so, we can add the following at the end of the form, just before the submit button:
```Javascript
{backendErrors &&
  backendErrors.map((error, index) => <TextError key={index}>{error.msg}</TextError>)
}
```

At `RestaurantsScreen`, we need to add the {route} as a component prop, and add another trigger value to the useEffect that queries the restaurant list. At the moment it was triggered if a loggedInUser was changed, now add the route param as follows:
`[loggedInUser, route]`

Test the complete solution.
    
** WARNING IF YOU ARE USING WINDOWS AS YOUR BACKEND SERVER **
Windows create routes using the backslash (\) instead of the regular slash (/). This can prevent the frontend from showing the images stored at the backend. In order to circunvent this issue you have to replace the source property when using the <Image> component.
For instance, in the <ImageCard> component, modify the <Image> component as follows:
```Javascript
    <Image style={styles.image} source={props.imageUri?.uri.replace(/\\/g, '/')} />
```

# 3. Create product validation and POST.
Follow the same steps to validate the create product form and to perform the post request.

Notice that when creating a new product, we will need to include the restaurantId where it belongs. This restaurant id should be received as: `route.params.id` when navigating from RestaurantDetailScreen to the CreateProductScreen.


# 4. Extra: Component refactoring
Discuss with your teacher and partners if some components could be refactored. Is it possible to create a submit button component so that we don't copy paste all the pressable details? Do you identify other elements that could be refactored as custom components and reused after?

Could it be possible to refactor de dropdown picker and its error message?
