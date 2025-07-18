import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PostProvider } from './contexts/PostContext';
import { SignalRProvider } from './contexts/SignalRContext';
import { Layout } from './components/common';
import { NotificationToast } from './components/features/notifications';
import { ChatButton } from './components/ui';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import MyPets from './pages/MyPets.tsx';
import AllPets from './pages/AllPets.tsx';
import Posts from './pages/Posts.tsx';
import PostDetail from './pages/PostDetail.tsx';
import PetDetail from './pages/PetDetail.tsx';
import CreatePost from './pages/CreatePost.tsx';
import MyPosts from './pages/MyPosts.tsx';
import UsersNearMe from './pages/UsersNearMe.tsx';
import PetsNearMe from './pages/PetsNearMe.tsx';
import PetConnectionRequests from './pages/PetConnectionRequests.tsx';
import Messages from './pages/Messages.tsx';
import ImageUploadDemo from './components/ImageUploadDemo.tsx';
import { ProtectedRoute } from './components/common';
import './App.css';

// Lazy load heavier components
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));

function App() {
  return (
    <AuthProvider>
      <SignalRProvider>
        <PostProvider>
          <Router>
            <NotificationToast />
            <ChatButton variant="fab" showUnreadBadge={true} />
            <Layout>
            <Suspense fallback={<div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px', 
              fontSize: '18px', 
              color: '#666' 
            }}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/posts/:postType" element={<Posts />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/pet/:id" element={<PetDetail />} />
                <Route path="/create-post" element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } />
                <Route path="/edit-post/:id" element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/profile/:userId" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/user/:userId" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/pets" element={<AllPets />} />
                <Route path="/my-pets" element={
                  <ProtectedRoute>
                    <MyPets />
                  </ProtectedRoute>
                } />
                <Route path="/my-posts" element={
                  <ProtectedRoute>
                    <MyPosts />
                  </ProtectedRoute>
                } />
                <Route path="/pet-connection-requests" element={
                  <ProtectedRoute>
                    <PetConnectionRequests />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/users-near-me" element={<UsersNearMe />} />
                <Route path="/pets-near-me" element={<PetsNearMe />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/image-upload-demo" element={<ImageUploadDemo />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </PostProvider>
      </SignalRProvider>
    </AuthProvider>
  );
}

export default App;
