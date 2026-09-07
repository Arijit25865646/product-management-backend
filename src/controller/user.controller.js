const User = require("../model/user.model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const getUser = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    console.log(
      "data coming in create controller",
      username,
      email,
      phone,
      password,
    );
    const existUser = await User.findOne({email});
    if(existUser){
        return res.status(500).json({
            success: false,
            message: "Email already register!!",
        })
    }
    const hashpassword = await bcrypt.hash(password, 10)
    const response = await User.create({
      username,
      email,
      phone,
      password: hashpassword,
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async(req, res)=>{
try {
  const { email, password } = req.body;
   const existUser = await User.findOne({email});
    if(!existUser){
        return res.status(500).json({
            success: false,
            message: "User not register!!",
        })
    }
    console.log("existUser", existUser);
    const passwordCheck = await bcrypt.compare(password, existUser.password);
    console.log("passwordcheck", passwordCheck);
    if(!passwordCheck){
      return res.status(500).json({
            success: false,
            message: "Password does not match!",
        });
    }
    //console.log("log in data coming",email, password);

    const token = jwt.sign({ username: existUser.username, email: existUser.email }, process.env.JWT_SECRET_KEY);

  res.status(200).json({
      success: true,
      message: "User login successfully",
      token,
      user: existUser,
    });
} catch (error) {
  res.status(500).json({
      success: false,
      message: error.message,
});
};
}

const updateUser = async (req, res) => {
   try {
    const { email, username, phone, password } = req.body;

    // Email is required to find the user
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user using email
    const existUser = await User.findOne({ email });

    // User not found
    if (!existUser) {
      return res.status(404).json({
        success: false,
        message: "User not registered",
      });
    }

    // Update username
    if (username) {
      existUser.username = username;
    }

    // Update phone
    if (phone) {
      existUser.phone = phone;
    }

    // Update password
    if (password) {
      const hashpassword = await bcrypt.hash(password, 10);
      existUser.password = hashpassword;
    }

    // IMPORTANT:
    // We are NOT updating existUser.email
    // Therefore email remains unchanged.

    const updatedUser = await existUser.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
   try {
    const { email } = req.body;

    // Check whether email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find and delete user
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not registered",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getUser,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
};
