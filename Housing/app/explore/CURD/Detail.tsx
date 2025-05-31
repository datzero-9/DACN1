import React, { useEffect, useRef, useState } from 'react';
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
interface CloudinaryUploadResponse {
  secure_url: string;
}
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';
const hostID = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;


type Address = {
  id: string;
  name: string;
};

export default function Detail() {
  const { user } = useUser();
  const router = useRouter()
  const [selected, setSelected] = useState('Bán')
  const [showOptions, setShowOptions] = useState(false)
  const options = [
    { id: 1, label: 'Bán', icon: 'cash-outline' },
    { id: 2, label: 'Cho thuê', icon: 'key-outline' },
  ]
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: showOptions ? options.length * 40 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // height cannot use native driver
    }).start();
  }, [showOptions]);


  const [bedroom, setBedroom] = useState(0);
  const [bathroom, setBathroom] = useState(0);
  const [floor, setFloor] = useState(0);
  const [demand, setDemand] = useState('')
  const [landArea, setLandArea] = useState('')
  const [price, setPrice] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState(""); // số điện thoại

  const [unitOpen, setUnitOpen] = useState(false);
  const [priceUnit, setPriceUnit] = useState(""); // "Tỷ", "Triệu"
  const [unitItems, setUnitItems] = useState([
    { label: "Tỷ", value: "Tỷ" },
    { label: "Triệu", value: "Triệu" },
  ]);


  const [open, setOpen] = useState(false);
  const [cateLand, setCateLand] = useState('')
  const [items, setItems] = useState([
    { label: "Đất thổ cư", value: "Đất thổ cư" },
    { label: "Đất nông nghiệp", value: "Đất nông nghiệp" },
    { label: "Đất công nghiệp", value: "Đất công nghiệp" },
    { label: "Đất nền dự án", value: "Đất nền dự án" },
  ]);
  const handleContinue = () => {

    if (!selected) return Alert.alert("Thiếu thông tin", "Vui lòng chọn nhu cầu.");
    if (!tinhTP) return Alert.alert("Thiếu thông tin", "Vui lòng chọn Tỉnh/Thành phố.");
    if (!quanHuyen) return Alert.alert("Thiếu thông tin", "Vui lòng chọn Quận/Huyện.");
    if (!phuongXa) return Alert.alert("Thiếu thông tin", "Vui lòng chọn Phường/Xã.");
    if (!street) return Alert.alert("Thiếu thông tin", "Vui lòng nhập tên đường.");
    // if (bedroom === 0) return Alert.alert("Thiếu thông tin", "Vui lòng nhập số phòng ngủ.");
    // if (bathroom === 0) return Alert.alert("Thiếu thông tin", "Vui lòng nhập số phòng vệ sinh.");
    // if (floor === 0) return Alert.alert("Thiếu thông tin", "Vui lòng nhập số tầng.");
    if (!cateLand) return Alert.alert("Thiếu thông tin", "Vui lòng chọn loại bất động sản.");
    if (!landArea) return Alert.alert("Thiếu thông tin", "Vui lòng nhập diện tích.");
    if (!price) return Alert.alert("Thiếu thông tin", "Vui lòng nhập giá.");
    if (!title) return Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề.");
    if (!description) return Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả.");
    if (imageUrls.length === 0) return Alert.alert("Thiếu thông tin", "Vui lòng thêm ít nhất một hình ảnh.");

    if (!phoneNumber) {
      return Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại.");
    }
    if (phoneNumber.length < 9 || phoneNumber.length > 11) {
      return Alert.alert("Sai định dạng", "Số điện thoại phải có từ 9 đến 11 chữ số.");
    }
    if (!/^\d+$/.test(phoneNumber)) {
      return Alert.alert("Sai định dạng", "Số điện thoại chỉ được chứa số.");
    }

    if (!priceUnit) {
      return Alert.alert("Thiếu thông tin", "Vui lòng chọn đơn vị giá.");
    }

    if (imageUrls.length === 0) return Alert.alert("Thiếu thông tin", "Vui lòng thêm ít nhất một hình ảnh.");

    const post = {
      id_user: user?.id,
      demand: selected,
      category: cateLand,
      land_area: landArea,
      price: price,
      bedroom: bedroom,
      bathroom: bathroom,
      floor: floor,
      list_images: imageUrls,
      address: street + ", " + phuongXa + ", " + quanHuyen + ", " + tinhTP,
      title: title,
      description: description,
      price_unit: priceUnit, // đơn vị giá
      phone_number: phoneNumber, // số điện thoại người đăng
    }
    try {
      axios.post(`${hostID}:80/api/createHouse`, post)
        .then((res) => {
          axios.post(`${hostID}:80/api/decrementTurn`, { id_user: user?.id })
            .then((res) => {
              console.log(res.data.message);
              console.log("Bạn còn lại lượt đăng bài: " + res.data.turn);
              axios.post(`https://n8n.laptrinhmang3.xyz/webhook/checkturn`);

              fakeLoadData()
            })
        })
    } catch (error) {
      console.log("có lỗi xảy ra")
    }
  };

  const pickImages = async (): Promise<void> => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access photos is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets;
      uploadMultipleImages(selectedImages);
    }
  };

  const uploadImgToCloudinary = async (
    image: ImagePicker.ImagePickerAsset
  ): Promise<string | null> => {
    const data = new FormData();

    data.append('file', {
      uri: image.uri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    } as any); // 👈 FormData types hơi strict, nên cần `as any`

    data.append('upload_preset', 'nxl7uozr');

    try {
      const res = await axios.post<CloudinaryUploadResponse>(
        'https://api.cloudinary.com/v1_1/dfv0n3vas/image/upload',
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return res.data.secure_url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };
  const uploadMultipleImages = async (
    images: ImagePicker.ImagePickerAsset[]
  ): Promise<void> => {
    setImageUrls([]); // reset trước
    const urls = await Promise.all(
      images.map((img) => uploadImgToCloudinary(img))
    );
    setImageUrls(urls.filter((url): url is string => Boolean(url)));
  };


  useEffect(() => {
    console.log('Image URLs:', imageUrls);
  }, [imageUrls]);


  // 1. State
  const [provinces, setProvinces] = useState<Address[]>([]);
  const [districts, setDistricts] = useState<Address[]>([]);
  const [wards, setWards] = useState<Address[]>([]);
  const [street, setStreet] = useState("");

  const [tinhTP, setTinhTP] = useState("");
  const [quanHuyen, setQuanHuyen] = useState("");
  const [phuongXa, setPhuongXa] = useState("");

  // 2. Lấy dữ liệu tỉnh thành khi component mount
  useEffect(() => {
    getProvinces();
  }, []);

  const getProvinces = async () => {
    try {
      const res = await axios.get(`https://open.oapi.vn/location/provinces?page=0&size=70`);
      setProvinces(res.data.data);
    } catch (err) {
      console.log("Lỗi khi lấy tỉnh/thành phố:", err);
    }
  };

  const getDistricts = async (provinceId: any) => {
    try {
      const res = await axios.get(`https://open.oapi.vn/location/districts/${provinceId}?page=0&size=70`);
      setDistricts(res.data.data);
    } catch (err) {
      console.log("Lỗi khi lấy quận/huyện:", err);
    }
  };

  const getWards = async (districtId: any) => {
    try {
      const res = await axios.get(`https://open.oapi.vn/location/wards/${districtId}?page=0&size=70`);
      setWards(res.data.data);
    } catch (err) {
      console.log("Lỗi khi lấy phường/xã:", err);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const fakeLoadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Thông báo!",
        "Đăng bài viết thành công !!!",
        [
          {
            text: "OK",
            onPress: () => router.push("/explore/CURD/Post"),
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    }, 3000);
  };







  const createDescription = (title: string) => {
    console.log("Tạo mô tả với tiêu đề:", title);
    axios.post(`https://n8n.laptrinhmang3.xyz/webhook/description`, { req: title })
      .then((res) => {
        setDescription(res.data)
      })
  }
  return (
    <SafeAreaView className="flex-1 bg-white m-0 p-0">

      {/* Header */}
      <View style={{ backgroundColor: 'red' }} className='p-2 flex-row items-center justify-between px-4 border-t border-gray-200'>
        <Text className="text-xl text-white font-bold ">Tạo tin đăng</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-sm font-medium border-white border rounded-3xl px-3 py-1">Thoát</Text>
        </TouchableOpacity>
      </View>
      {isLoading && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
        >
          <View className="flex-1 justify-center items-center bg-black/60">
            <View className="bg-zinc-800 px-6 py-4 rounded-xl items-center">
              <ActivityIndicator
                size="large"
                color="#fff"
              />
              <Text className="text-white mt-2 text-base">Đang tải...</Text>
            </View>
          </View>
        </Modal>
      )}
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => "key"}
        ListHeaderComponent={
          <View className="bg-gray-100 p-4">
            {/* Nhu cầu */}
            <View className="bg-white p-4 rounded-2xl mb-4">
              <Text className="font-medium mb-1">Nhu cầu</Text>

              <TouchableOpacity
                onPress={() => setShowOptions(!showOptions)}
                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-3 flex-row justify-between items-center"
              >
                <Text>{selected}</Text>
                {showOptions
                  ? <Ionicons name="chevron-up-outline" size={20} />
                  : <Ionicons name="chevron-down-outline" size={20} />}
              </TouchableOpacity>

              {/* Animated Dropdown */}
              <Animated.View
                style={{
                  height: dropdownHeight,
                  overflow: 'hidden',
                }}
                className="flex-row justify-between rounded-md mt-1 bg-white"
              >
                {options.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setSelected(item.label);
                      setShowOptions(false);
                    }}
                    className="px-4 py-2 border border-gray-300  mx-2 rounded-3xl w-[40%]"
                  >
                    <Ionicons name={item.icon as any} size={30} color="gray" />
                    <Text className='font-medium text-[16px]'>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>

            <View className="bg-white p-4 rounded-2xl mb-4">
              <Text className="font-medium mb-1">Địa chỉ BĐS</Text>
              <View className="p-4">
                {/* Tỉnh / Thành phố */}
                <View>
                  <Text className="font-semibold mb-1">Tỉnh/Thành phố:</Text>
                  <View className="border border-gray-400 rounded bg-white mb-2">
                    <Picker
                      selectedValue={tinhTP}
                      onValueChange={(itemValue) => {
                        const selected = provinces.find((p) => p.id === itemValue);
                        console.log(selected)
                        setTinhTP(selected?.name || "");
                        getDistricts(itemValue);
                        setQuanHuyen("");
                        setPhuongXa("");
                        setWards([]);
                      }}
                    >
                      <Picker.Item label="Chọn Tỉnh/Thành phố" value="" />
                      {provinces.map((item) => (
                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Quận / Huyện */}
                <View>
                  <Text className="font-semibold mb-1">Quận/Huyện:</Text>
                  <View className="border border-gray-400 rounded bg-white mb-2">
                    <Picker
                      selectedValue={quanHuyen}
                      onValueChange={(itemValue) => {
                        const selected = districts.find((d) => d.id === itemValue);
                        setQuanHuyen(selected?.name || "");
                        getWards(itemValue);
                        setPhuongXa("");
                      }}
                    >
                      <Picker.Item label="Chọn Quận/Huyện" value="" />
                      {districts.map((item) => (
                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Phường / Xã */}
                <View>
                  <Text className="font-semibold mb-1">Phường/Xã:</Text>
                  <View className="border border-gray-400 rounded bg-white mb-2">
                    <Picker
                      selectedValue={phuongXa}
                      onValueChange={(itemValue) => {
                        const selected = wards.find((w) => w.id === itemValue);
                        setPhuongXa(selected?.name || "");
                      }}
                    >
                      <Picker.Item label="Chọn Phường/Xã" value="" />
                      {wards.map((item) => (
                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Tên đường  */}
                <View>
                  <Text className="font-semibold mb-1">Tên đường/ tổ/ ấp:</Text>
                  <TextInput
                    className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
                    placeholder="Nhập địa chỉ ở đây"
                    value={street}
                    onChangeText={setStreet}
                  />
                </View>
              </View>
            </View>

            {/* //thông tin chính */}
            <View className="bg-white p-4 rounded-2xl mb-4">
              <Text className="font-medium mb-2">Thông tin chính</Text>
              <View className="z-50 mb-4">
                <Text className="text-sm font-medium mb-1">Loại BĐS</Text>

                <DropDownPicker
                  open={open}
                  value={cateLand}
                  items={items}
                  setOpen={setOpen}
                  setValue={setCateLand}
                  setItems={setItems}
                  placeholder="Chọn loại BĐS"

                  style={{
                    borderRadius: 20,
                    borderColor: "#ccc",
                    backgroundColor: "#f0f0f0",
                    height: 35,
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#ccc",
                    borderRadius: 12,
                  }}
                  textStyle={{
                    fontSize: 14,
                  }}
                />
              </View>
              <View>
                <Text className="text-sm font-medium">Diện Tich m2</Text>
                <TextInput
                  className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
                  placeholder="Nhập diện tích "
                  value={landArea}
                  onChangeText={setLandArea}
                />
              </View>
              <View className='flex-row justify-between items-center z-20'>
                {/* Ô nhập giá */}
                <View className='w-[65%]'>
                  <Text className="text-sm font-medium mb-1">Mức giá</Text>
                  <TextInput
                    className="border border-gray-300 bg-gray-200 rounded-full px-4 py-2"
                    placeholder="Nhập giá"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>

                {/* Dropdown đơn vị */}
                <View className='w-[30%]'>
                  <Text className="text-sm font-medium mb-1">Đơn vị</Text>
                  <DropDownPicker
                    open={unitOpen}
                    value={priceUnit}
                    items={unitItems}
                    setOpen={setUnitOpen}
                    setValue={setPriceUnit}
                    setItems={setUnitItems}
                    placeholder="Đơn vị"
                    style={{
                      borderRadius: 20,
                      borderColor: "#ccc",
                      backgroundColor: "#f0f0f0",
                      height: 40,
                    }}
                    dropDownContainerStyle={{
                      borderColor: "#ccc",
                      borderRadius: 12,
                      marginTop: 4,
                      zIndex: 2000, // đảm bảo nổi lên
                    }}
                    textStyle={{
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>


            </View>

            <View className="bg-white p-4 rounded-2xl mb-4">
              {/* Số phòng ngủ */}
              <View className="flex-row justify-between items-center mt-4">
                <Text className="text-sm font-medium">Số phòng ngủ</Text>
                <View className="flex-row items-center space-x-3">
                  <Pressable
                    onPress={() => setBedroom(Math.max(0, bedroom - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Text className="text-xl font-semibold">-</Text>
                  </Pressable>
                  <Text className="text-base mx-2">{bedroom}</Text>
                  <Pressable
                    onPress={() => setBedroom(bedroom + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Text className="text-xl font-semibold">+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Số phòng tắm, vệ sinh */}
              <View className="flex-row justify-between items-center mt-4">
                <Text className="text-sm font-medium">Số phòng tắm, vệ sinh</Text>
                <View className="flex-row items-center space-x-3">
                  <Pressable
                    onPress={() => setBathroom(Math.max(0, bathroom - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Text className="text-xl font-semibold">-</Text>
                  </Pressable>
                  <Text className="text-base mx-2">{bathroom}</Text>
                  <Pressable
                    onPress={() => setBathroom(bathroom + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Text className="text-xl font-semibold">+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Số tầng */}
              <View className="flex-row justify-between items-center mt-4">
                <Text className="text-sm font-medium">Số tầng</Text>
                <View className="flex-row items-center space-x-3">
                  <Pressable
                    onPress={() => setFloor(Math.max(0, floor - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Text className="text-xl font-semibold">-</Text>
                  </Pressable>
                  <Text className="text-base mx-2">{floor}</Text>
                  <Pressable
                    onPress={() => setFloor(floor + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Text className="text-xl font-semibold">+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* //thông tin liên hệ */}
            <View className="bg-white p-4 rounded-2xl mb-4">
              <Text className="font-medium mb-2">Thông tin liên hệ</Text>
              <View>
                <Text className="text-sm font-medium">Tên liên hệ</Text>
                <TextInput
                  className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
                  placeholder="Hoàng Tiến Đạt"
                />
              </View>
              <View>
                <Text className="text-sm font-medium">Email</Text>
                <TextInput
                  className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
                  placeholder="Email"
                />
              </View>
              <View className=''>

                <Text className="text-sm font-medium">Số điện thoại</Text>
                <TextInput
                  className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                  placeholder="Số điện thoại"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />


              </View>
            </View>




            <View className="bg-white p-4 rounded-2xl mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-base">Tiêu đề & Mô tả</Text>
                <TouchableOpacity className="flex-row items-center bg-purple-100 px-3 py-2 rounded-2xl"
                  onPress={() => createDescription("giới thiệu 1 ngôi nhà đẹp")}
                >
                  <Ionicons name="sparkles-outline" size={16} color="#7c3aed" />
                  <Text className="text-sm font-medium text-purple-700 ml-1">Tạo với AI</Text>
                </TouchableOpacity>
              </View>

              {/* Tiêu đề */}
              <View>

                <Text className="text-sm font-medium mb-1">Tiêu đề</Text>
                <TextInput
                  className="border border-gray-300 bg-white text-sm rounded-xl p-3 mb-1"
                  placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ..."
                  multiline
                  value={title}
                  onChangeText={setTitle}
                />
                <Text className="text-gray-400 text-xs mb-4">Tối thiểu 30 ký tự, tối đa 99 ký tự</Text>
              </View>

              {/* Mô tả */}
              <View>
                <Text className="text-sm font-medium mb-1">Mô tả</Text>
                <TextInput
                  className="border border-gray-300 bg-white text-sm rounded-xl p-3"
                  placeholder={`Mô tả chi tiết về:\n• loại hình bất động sản\n• vị trí\n• diện tích, tiện ích\n• tình trạng nội thất\n\n(VD: Khu nhà có vị trí thuận lợi, gần công viên, trường học...)`}
                  multiline
                  numberOfLines={20}
                  value={description}
                  onChangeText={setDescription}
                />
                <Text className="text-gray-400 text-xs mt-2">Tối thiểu 30 ký tự, tối đa 3000 ký tự</Text>
              </View>

              <TouchableOpacity onPress={() => pickImages()} className='bg-gray-200 flex-row justify-center items-center my-2 rounded-xl'>
                <Text className="p-2 font-medium">Chọn ảnh</Text>
              </TouchableOpacity>
              <View className='flex-row flex-wrap justify-center'>
                {imageUrls.map((url, index) => (
                  <TouchableOpacity className='w-[40%] bg-gray-100 m-1 rounded-md' onPress={() => console.log(url)} key={index}>
                    <Image
                      source={{ uri: url }}
                      className=" h-[100px] rounded-md m-2"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>


          </View>
        }
      />

      {/* Nút tiếp tục */}

      <TouchableOpacity onPress={() => { handleContinue() }} className="bg-red-600 py-3 rounded-full items-center mx-10 my-5 ">
        <Text className="text-white font-semibold text-base">Tiếp tục</Text>
      </TouchableOpacity>

    </SafeAreaView >
  )
}
