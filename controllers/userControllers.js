const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const path = require("path")
const {v4: uuid} = require("uuid")


const User = require("../models/userModel")
const HttpError = require("../models/errorModel")



// =============================== REGISTER A NEW USER ====================================
// POST : api/users/register

// UNPROTECTED
const registerUser = async (req, res, next) => {
    try {
      const { name, email, password, password2 } = req.body;
  
      // Validate required fields
      if (!name || !email || !password || !password2) {
        return next(new HttpError("Please fill in all fields", 422));
      }
  
      // Normalize email case
      const newEmail = email.toLowerCase();
  
      // Check if email already exists
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        return next(new HttpError("Email already exists", 422));
      }
  
      // Validate password length
      if (password.trim().length < 6) {
        return next(new HttpError("Password should be at least 6 characters", 422));
      }
  
      // Ensure passwords match
      if (password !== password2) {
        return next(new HttpError("Passwords do not match", 422));
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
  
      // Create the user
      const newUser = await User.create({
        name,
        email: newEmail,
        password: hashedPass,
      });
  
      res.status(201).json({ message: `New user ${newUser.email} registered` });
    } catch (error) {
      // Handle unexpected errors
      console.error("Error during user registration:", error);
      return next(new HttpError("User registration failed.", 500));
    }
  };







// =============================== LOGIN A REGISTERED USER ====================================
// POST : api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {

    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError("Fill in all fields", 422))
        }
        const newEmail = email.toLowerCase();

        const user = await User.findOne({email: newEmail})
        if(!user) {
            return next(new HttpError("Invalid email or password", 422))
        }

        const comparePass = await bcrypt.compare(password, user.password)
        if(!comparePass) {
            return next(new HttpError("Invalid email or password", 422))
        }

        const {_id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({
            token,
            id,
            name
        })
        
    } catch (error) {
        return next(new HttpError("login failed please check your credentials", 422))
    }
}









// =============================== USER PROFILE ====================================
// GET : api/users/:id
// PROTECTED
const getUser = async (req, res, next) => {

    try {
          // const {id} = req.user;
        const {id} = req.params;
        const user = await User.findById(id).select('-password');
        if(!user) {
            return next(new HttpError("User not found", 404))
        }
        res.status(200).json(user)
        
    } catch (error) {
        return next(new HttpError(error))
    }
}










// =============================== CHANGE USER AVATAR (profile picture) ====================================
// POST : api/users/change-avatar
// PROTECTED


const changeAvatar = async (req, res, next) => {
    try {
        if (!req.files.avatar) {
            return next(new HttpError("Please choose an image", 422));
        }

        // Find user from the database
        const user = await User.findById(req.user.id);

        // Delete old avatar if it exists
        if (user.avatar) {
            const oldAvatarPath = path.join(__dirname, '..', 'uploads', user.avatar);
            
            // Check if file exists before unlinking
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlink(oldAvatarPath, (err) => {
                    if (err) {
                        return next(new HttpError(err));
                    }
                });
            }
        }

        const { avatar } = req.files;

        // Check file size
        if (avatar.size > 500000) {
            return next(new HttpError("Profile picture is too big. Should be less than 500KB", 422));
        }

        // Generate a new filename
        const splittedFilename = avatar.name.split('.');
        const newFilename = `${splittedFilename[0]}${uuid()}.${splittedFilename[splittedFilename.length - 1]}`;

        // Move the new avatar to the uploads folder
        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err));
            }

            // Update user avatar in the database
            const updatedAvatar = await User.findByIdAndUpdate(
                req.user.id,
                { avatar: newFilename },
                { new: true }
            );

            if (!updatedAvatar) {
                return next(new HttpError("Avatar couldn't be changed", 422));
            }

            res.status(200).json(updatedAvatar);
        });
    } catch (error) {
        return next(new HttpError(error));
    }
};



// =============================== EDIT USER DETAILS (from profile) ====================================
// POST : api/users/change-avatar
// PROTECTED
const editUser = async (req, res, next) => {

    try {
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if(!name || !email || !currentPassword || !newPassword) {
            return next(new HttpError("Fill in all fields", 422))
        }

        // get user from database
        const user = await User.findById(req.user.id);
        if(!user) {
            return next(new HttpError("User not found", 403))
        }

        // make sure email doesn't exist
        const emailExist = await User.findOne({email});
        if(emailExist && (emailExist._id != req.user.id)) {
            return next(new HttpError("Email already exist", 422))
        }
        // compare current password to db password
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if(!validateUserPassword) {
            return next(new HttpError("Invalid current password", 422))
        }

        // compare new password
        if(newPassword !== confirmNewPassword) {
            return next(new HttpError("New passwords do not match", 422))
        }

        // hash new password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassword, salt);

        // update user info in database
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: hash}, {new: true})
        res.status(200).json(newInfo)

        
    } catch (error) {
        return next(new HttpError(error))
    }
}










// =============================== GET AUTHORS ====================================
// POST : api/users/authors
// UNPROTECTED
const getAuthors = async (req, res, next) => {

    try {
        const authors = await User.find().select('-password');
        res.json(authors)
    } catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors}