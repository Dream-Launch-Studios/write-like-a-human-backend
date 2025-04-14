import express, { Request, Response } from "express";
import { getCurrentUser, login, register } from "../controllers/authController";
import { createClient } from '@supabase/supabase-js';
import prisma from "../config/config";
import { UserRole } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.middleware";
import { SubscriptionService } from "../services/subscription.service";

const Authrouter = express.Router();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const subscriptionService = new SubscriptionService();
Authrouter.post("/register", register);
Authrouter.post("/login", login);
Authrouter.get("/me", authMiddleware, getCurrentUser);

// Authrouter.post("/sync-user", async (req: Request, res: Response): Promise<any> => {
//     console.log(`👆👆👆👆👆 Route called: /sync-user`);
//     try {
//         // Get token from authorization header
//         const authHeader = req.headers.authorization;
//         console.log(`Authorization header: ${authHeader ? "Present" : "Missing"}`);

//         if (!authHeader) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Missing authorization header'
//             });
//         }

//         const token = authHeader.split(' ')[1];
//         console.log(`Token extracted: ${token ? token.substring(0, 15) + "..." : "Invalid token format"}`);

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid authorization format'
//             });
//         }

//         // Use Supabase Admin API to verify the token
//         console.log("🔐 Verifying token with Supabase Admin API");
//         const { data, error } = await supabaseAdmin.auth.getUser(token);

//         if (error) {
//             console.error('❌ Supabase verification error:', error);
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid token',
//                 error: error.message
//             });
//         }

//         console.log('✅ Token verification successful!');
//         console.log('👤 Supabase user:', data.user.id);

//         // Check if user already exists in your database
//         const existingUser = await prisma.user.findUnique({
//             where: { id: data.user.id }
//         });

//         if (existingUser) {
//             console.log('👤 User already exists in database');
//             return res.status(200).json({
//                 success: true,
//                 message: 'User already exists',
//                 user: existingUser
//             });
//         }

//         // Extract additional user data from request body
//         const { name, role = 'STUDENT' } = req.body;

//         // Create the user in your database
//         const newUser = await prisma.user.create({
//             data: {
//                 id: data.user.id,
//                 email: data.user.email || '',
//                 name: name || '',
//                 password: '', // Not used with Supabase auth
//                 isEmailVerified: data.user.email_confirmed_at !== null,
//                 role: role as 'STUDENT' | 'TEACHER' | 'ADMIN'
//             }
//         });

//         console.log('✅ User created in database:', newUser.id);

//         // Return the newly created user
//         return res.status(201).json({
//             success: true,
//             message: 'User registered successfully',
//             user: newUser
//         });

//     } catch (error) {
//         console.error('⚠️ Server error during registration:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Server error during registration',
//             error: error instanceof Error ? error.message : 'Unknown error'
//         });
//     }
// });


Authrouter.post("/sync-user", async (req: Request, res: Response): Promise<any> => {
    console.log(`👆👆👆👆👆 Route called: /sync-user`);
    try {
        // const authHeader = req.headers.authorization;
        // console.log(`Authorization header: ${authHeader ? "Present" : "Missing"}`);

        // if (!authHeader) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Missing authorization header'
        //     });
        // }

        // const token = authHeader.split(' ')[1];
        // console.log(`Token extracted: ${token ? token.substring(0, 15) + "..." : "Invalid token format"}`);

        // if (!token) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Invalid authorization format'
        //     });
        // }
        const { id, name, email, role, secret, } = req.body
        console.log(`🍎 got this body ->`, req.body)

        if (!id || !name || !email || !secret || !role) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (secret !== process.env.SUPABASE_JWT_SECRET) {
            return res.status(401).json({
                success: false,
                message: 'Invalid secret'
            });
        }

        if (role === UserRole.ADMIN) {
            return res.status(400).json({
                success: false,
                message: 'Admin role is not allowed to register from api!'
            });
        }

        try {
            // const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            // console.log(`decodedToken 🤜`, decodedToken)
            // const userId = decodedToken.sub;

            // if (!userId) {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'Invalid token format - no user ID found'
            //     });
            // }

            // console.log('Decoded user ID from token:', userId);

            const existingUser = await prisma.user.findUnique({
                where: { id }
            });
            if (existingUser) {
                await subscriptionService.createFreeSubscriptionForNewUser(existingUser.id);
                console.log('👤 User already exists in database');
                return res.status(200).json({
                    success: true,
                    message: 'User already exists',
                    user: existingUser
                });
            }

            // Extract user data from request and token
            // const { name, role = 'STUDENT', id } = req.body;
            // const email = decodedToken.email || '';
            // const isEmailVerified = !!decodedToken.email_confirmed_at;

            // Create the user in your database
            // const userIdToUse = userId ?? id;
            // console.log(`creating user with id ${userIdToUse}`)

            const newUser = await prisma.user.create({
                data: {
                    id,
                    email,
                    name: name || '',
                    password: '',
                    isEmailVerified: false,
                    role: role as UserRole
                }
            });
            console.log('✅ User created in database:', newUser.id);
            await subscriptionService.createFreeSubscriptionForNewUser(newUser.id);
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: newUser
            });

        } catch (decodeError) {
            console.error('Error decoding token:', decodeError);
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }

    } catch (error) {
        console.error('⚠️ Server error during registration:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


Authrouter.patch("/update-user", async (req: Request, res: Response): Promise<any> => {
    console.log(`👆👆👆👆👆 Route called: /update-user`);
    try {
        // Get token from authorization header
        const authHeader = req.headers.authorization;
        console.log(`Authorization header: ${authHeader ? "Present" : "Missing"}`);

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Missing authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log(`Token extracted: ${token ? token.substring(0, 15) + "..." : "Invalid token format"}`);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
        }

        // Try to get user from token using Supabase verification
        let userId;

        try {
            // Verify token with Supabase
            const { data, error } = await supabaseAdmin.auth.getUser(token);

            if (error) {
                console.error('Supabase verification error:', error);
                // If Supabase verification fails, try decoding the token manually
                const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                userId = decodedToken.sub;

                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid token - cannot identify user'
                    });
                }
            } else {
                userId = data.user.id;
            }
        } catch (tokenError) {
            console.error('Token processing error:', tokenError);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Get user from database
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found in database'
            });
        }

        // Rest of your update-user code remains the same...
        // ...
    } catch (error) {
        console.error('⚠️ Server error during user update:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during user update',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


// Authrouter.patch("/verify-email", async (req: Request, res: Response): Promise<any> => {
//     console.log(`👆👆👆👆👆 Route called: /verify-email`);
//     try {
//         // Get token from authorization header
//         const authHeader = req.headers.authorization;
//         if (!authHeader) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Missing authorization header'
//             });
//         }

//         const token = authHeader.split(' ')[1];
//         console.log(`token 🤜 ${token}`);

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid authorization format'
//             });
//         }

//         // Try to get user from token using Supabase verification
//         let userId;
//         let isAdmin = false;

//         try {
//             // Verify token with Supabase
//             const { data, error } = await supabaseAdmin.auth.getUser(token);

//             if (error) {
//                 console.error('Supabase verification error:', error);
//                 // If Supabase verification fails, try decoding the token manually
//                 const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
//                 userId = decodedToken.sub;

//                 if (!userId) {
//                     return res.status(401).json({
//                         success: false,
//                         message: 'Invalid token - cannot identify user'
//                     });
//                 }
//             } else {
//                 userId = data.user.id;
//             }
//         } catch (tokenError) {
//             console.error('Token processing error:', tokenError);
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid token'
//             });
//         }

//         // Get requesting user from database
//         const adminUser = await prisma.user.findUnique({
//             where: { id: userId }
//         });

//         if (!adminUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Admin user not found in database'
//             });
//         }

//         // Only admins can use this endpoint
//         if (adminUser.role !== 'ADMIN') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Only administrators can update email verification status'
//             });
//         }

//         const { userId: targetUserId, isVerified } = req.body;

//         if (!targetUserId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User ID is required'
//             });
//         }

//         if (isVerified === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Verification status is required'
//             });
//         }

//         // Find the user to verify
//         const userToVerify = await prisma.user.findUnique({
//             where: { id: targetUserId }
//         });

//         if (!userToVerify) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         // Update our database
//         const updatedUser = await prisma.user.update({
//             where: { id: targetUserId },
//             data: {
//                 isEmailVerified: Boolean(isVerified)
//             }
//         });

//         // If we're verifying the email, also try to update Supabase
//         if (isVerified) {
//             try {
//                 await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
//                     email_confirm: true
//                 });
//                 console.log('✅ Email confirmed in Supabase for user:', targetUserId);
//             } catch (supabaseError) {
//                 console.error('⚠️ Failed to update Supabase email verification:', supabaseError);
//                 // Continue anyway - we've already updated our database
//             }
//         }

//         return res.status(200).json({
//             success: true,
//             message: `Email verification ${isVerified ? 'confirmed' : 'removed'} successfully`,
//             user: updatedUser
//         });

//     } catch (error) {
//         console.error('⚠️ Server error updating email verification:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Server error updating email verification',
//             error: error instanceof Error ? error.message : 'Unknown error'
//         });
//     }
// });


Authrouter.patch("/verify-email", async (req: Request, res: Response): Promise<any> => {
    console.log(`👆👆👆👆👆 Route called: /verify-email`);
    try {
        const { id, secret } = req.body
        if (!id || !secret) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields - id or secret'
            });
        }


        if (secret !== process.env.SUPABASE_JWT_SECRET) {
            return res.status(401).json({
                success: false,
                message: 'Invalid secret'
            });
        }
        // // Get token from authorization header
        // const authHeader = req.headers.authorization;
        // console.log(`Authorization header: ${authHeader ? "Present" : "Missing"}`);

        // if (!authHeader) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Missing authorization header'
        //     });
        // }

        // const token = authHeader.split(' ')[1];
        // console.log(`Token extracted: ${token ? token.substring(0, 15) + "..." : "Invalid token format"}`);

        // if (!token) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Invalid authorization format'
        //     });
        // }

        // Try to get user from token using Supabase verification

        // try {
        //     console.log("🔐 Attempting to verify token with Supabase");
        //     // Verify token with Supabase
        //     const { data, error } = await supabaseAdmin.auth.getUser(token);

        //     if (error) {
        //         console.error('❌ Supabase verification error:', error);
        //         console.log("🔄 Falling back to manual token decoding");

        //         // If Supabase verification fails, try decoding the token manually
        //         const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        //         userId = decodedToken.sub;
        //         console.log(`📋 Decoded token payload:`, JSON.stringify(decodedToken, null, 2));
        //         console.log(`👤 User ID from decoded token: ${userId}`);

        //         if (!userId) {
        //             console.error("❌ No user ID found in decoded token");
        //             return res.status(401).json({
        //                 success: false,
        //                 message: 'Invalid token - cannot identify user'
        //             });
        //         }
        //     } else {
        //         userId = data.user.id;
        //         console.log(`✅ Token verified successfully by Supabase`);
        //         console.log(`👤 User ID from Supabase: ${userId}`);
        //     }
        // } catch (tokenError) {
        //     console.error('⚠️ Token processing error:', tokenError);
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Invalid token'
        //     });
        // }

        // Extract request parameters
        // const { targetUserId, isVerified } = req.body;
        // console.log(`📝 Request body:`, req.body);
        // console.log(`🎯 Target user ID: ${targetUserId || 'not provided (using authenticated user)'}`);
        // console.log(`✓ isVerified value: ${isVerified}`);

        // If no target user specified, use the authenticated user
        // const userIdToUpdate = targetUserId || userId;
        // const userIdToUpdate = userId;
        // console.log(`🔄 User ID to update: ${userIdToUpdate}`);

        // Find the user to verify
        // console.log(`🔍 Looking up user in database: ${userIdToUpdate}`);
        const userToVerify = await prisma.user.findUnique({
            where: { id }
        });

        if (!userToVerify) {
            console.error(`❌ User not found in database: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log(`✅ User found in database:`, {
            id: userToVerify.id,
            email: userToVerify.email,
            currentVerificationStatus: userToVerify.isEmailVerified
        });

        // Update our database
        console.log(`📝 Updating email verification status to: true`);
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                isEmailVerified: true
            }
        });
        console.log(`✅ Database updated successfully`);

        // If we're verifying the email, also try to update Supabase
        if (true) {
            try {
                console.log(`🔄 Attempting to update Supabase email verification`);
                await supabaseAdmin.auth.admin.updateUserById(id, {
                    email_confirm: true
                });
                console.log('✅ Email confirmed in Supabase for user:', id);
            } catch (supabaseError) {
                console.error('⚠️ Failed to update Supabase email verification:', supabaseError);
                console.log('🔄 Continuing with local database update only');
                // Continue anyway - we've already updated our database
            }
        }

        console.log(`🎉 Email verification update complete`);
        return res.status(200).json({
            success: true,
            message: `Email verification ${true ? 'confirmed' : 'removed'} successfully`,
            user: updatedUser
        });

    } catch (error) {
        console.error('⚠️ Server error updating email verification:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating email verification',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default Authrouter;