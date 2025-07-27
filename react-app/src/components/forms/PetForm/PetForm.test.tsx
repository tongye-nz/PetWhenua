import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils/test-utils'
import PetForm from './PetForm'

// Mock the usePetForm hook
const mockUsePetForm = {
  formData: {
    name: '',
    species: '',
    breed: '',
    birthDate: '',
    description: '',
    profilePicture: null
  },
  errors: {},
  picturePreview: null,
  processedImageFile: null,
  handleInputChange: vi.fn(),
  handlePictureUpload: vi.fn(),
  handlePictureUploadSuccess: vi.fn(),
  handlePictureError: vi.fn(),
  handleRemovePicture: vi.fn(),
  handleSubmit: vi.fn()
}

vi.mock('../../../hooks/usePetForm', () => ({
  usePetForm: vi.fn(() => mockUsePetForm)
}))

// Mock the pet feature components
vi.mock('../../features/pets', () => ({
  PetPictureUpload: vi.fn().mockImplementation(({ 
    profilePicture, 
    onPictureUpload, 
    onPictureUploadSuccess, 
    onPictureError, 
    onRemovePicture, 
    error, 
    petId 
  }) => (
    <div data-testid="pet-picture-upload">
      <div>Profile Picture: {profilePicture || 'No picture'}</div>
      <div>Pet ID: {petId || 'No ID'}</div>
      <div>Error: {error || 'No error'}</div>
      <button onClick={onPictureUpload}>Upload Picture</button>
      <button onClick={onPictureUploadSuccess}>Upload Success</button>
      <button onClick={onPictureError}>Picture Error</button>
      <button onClick={onRemovePicture}>Remove Picture</button>
    </div>
  )),
  PetBasicInfoForm: vi.fn().mockImplementation(({ formData, errors, onInputChange }) => (
    <div data-testid="pet-basic-info-form">
      <div>Pet Name: {formData.name}</div>
      <div>Species: {formData.species}</div>
      <div>Breed: {formData.breed}</div>
      <div>Birth Date: {formData.birthDate}</div>
      <div>Description: {formData.description}</div>
      <div>Errors: {JSON.stringify(errors)}</div>
      <button onClick={() => onInputChange('name', 'Test Pet')}>Change Name</button>
    </div>
  )),
  PetFormActions: vi.fn().mockImplementation(({ onCancel, isLoading, submitLabel, showCancel }) => (
    <div data-testid="pet-form-actions">
      <div>Submit Label: {submitLabel}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Show Cancel: {showCancel ? 'Yes' : 'No'}</div>
      {showCancel && <button onClick={onCancel}>Cancel</button>}
      <button type="submit">Submit</button>
    </div>
  ))
}))

describe('PetForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
    error: null,
    submitLabel: 'Save Pet',
    petId: undefined
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset mock hook to default values
    Object.assign(mockUsePetForm, {
      formData: {
        name: '',
        species: '',
        breed: '',
        birthDate: '',
        description: '',
        profilePicture: null
      },
      errors: {},
      picturePreview: null,
      processedImageFile: null,
      handleInputChange: vi.fn(),
      handlePictureUpload: vi.fn(),
      handlePictureUploadSuccess: vi.fn(),
      handlePictureError: vi.fn(),
      handleRemovePicture: vi.fn(),
      handleSubmit: vi.fn()
    })
  })

  describe('rendering', () => {
    it('should render all form sections', () => {
      render(<PetForm {...defaultProps} />)
      
      expect(screen.getByTestId('pet-picture-upload')).toBeInTheDocument()
      expect(screen.getByTestId('pet-basic-info-form')).toBeInTheDocument()
      expect(screen.getByTestId('pet-form-actions')).toBeInTheDocument()
    })

    it('should show "Add New Pet" title for new pets', () => {
      render(<PetForm {...defaultProps} />)
      
      expect(screen.getByText('Add New Pet')).toBeInTheDocument()
    })

    it('should show "Edit Pet Profile" title for existing pets', () => {
      render(<PetForm {...defaultProps} initialData={{ name: 'Existing Pet' }} />)
      
      expect(screen.getByText('Edit Pet Profile')).toBeInTheDocument()
    })

    it('should show error message when error prop is provided', () => {
      render(<PetForm {...defaultProps} error="Something went wrong" />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should not show error message when no error', () => {
      render(<PetForm {...defaultProps} />)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('hook integration', () => {
    it('should pass correct props to usePetForm hook', () => {
      const { usePetForm } = require('../../../hooks/usePetForm')
      const initialData = { name: 'Test Pet', species: 'Dog' }
      const onSubmit = vi.fn()
      
      render(<PetForm {...defaultProps} initialData={initialData} onSubmit={onSubmit} />)
      
      expect(usePetForm).toHaveBeenCalledWith({
        initialData,
        onSubmit
      })
    })

    it('should handle form submission through hook', () => {
      render(<PetForm {...defaultProps} />)
      
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')!
      fireEvent.submit(form)
      
      expect(mockUsePetForm.handleSubmit).toHaveBeenCalled()
    })
  })

  describe('PetPictureUpload integration', () => {
    it('should pass correct props to PetPictureUpload', () => {
      const picturePreview = 'data:image/jpeg;base64,test'
      const petId = 123
      const errors = { profilePicture: 'Invalid image' }
      
      Object.assign(mockUsePetForm, {
        picturePreview,
        errors
      })
      
      render(<PetForm {...defaultProps} petId={petId} />)
      
      const pictureUpload = screen.getByTestId('pet-picture-upload')
      expect(pictureUpload).toHaveTextContent(`Profile Picture: ${picturePreview}`)
      expect(pictureUpload).toHaveTextContent(`Pet ID: ${petId}`)
      expect(pictureUpload).toHaveTextContent('Error: Invalid image')
    })

    it('should handle picture upload actions', () => {
      render(<PetForm {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Upload Picture'))
      expect(mockUsePetForm.handlePictureUpload).toHaveBeenCalled()
      
      fireEvent.click(screen.getByText('Upload Success'))
      expect(mockUsePetForm.handlePictureUploadSuccess).toHaveBeenCalled()
      
      fireEvent.click(screen.getByText('Picture Error'))
      expect(mockUsePetForm.handlePictureError).toHaveBeenCalled()
      
      fireEvent.click(screen.getByText('Remove Picture'))
      expect(mockUsePetForm.handleRemovePicture).toHaveBeenCalled()
    })

    it('should show no petId when not provided', () => {
      render(<PetForm {...defaultProps} />)
      
      const pictureUpload = screen.getByTestId('pet-picture-upload')
      expect(pictureUpload).toHaveTextContent('Pet ID: No ID')
    })
  })

  describe('PetBasicInfoForm integration', () => {
    it('should pass form data and errors to PetBasicInfoForm', () => {
      const formData = {
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        birthDate: '2020-01-15',
        description: 'A friendly dog',
        profilePicture: null
      }
      const errors = {
        name: 'Name is required',
        species: 'Species is required'
      }
      
      Object.assign(mockUsePetForm, { formData, errors })
      
      render(<PetForm {...defaultProps} />)
      
      const basicInfoForm = screen.getByTestId('pet-basic-info-form')
      expect(basicInfoForm).toHaveTextContent('Pet Name: Buddy')
      expect(basicInfoForm).toHaveTextContent('Species: Dog')
      expect(basicInfoForm).toHaveTextContent('Breed: Golden Retriever')
      expect(basicInfoForm).toHaveTextContent('Birth Date: 2020-01-15')
      expect(basicInfoForm).toHaveTextContent('Description: A friendly dog')
      expect(basicInfoForm).toHaveTextContent(JSON.stringify(errors))
    })

    it('should handle input changes through hook', () => {
      render(<PetForm {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Change Name'))
      expect(mockUsePetForm.handleInputChange).toHaveBeenCalledWith('name', 'Test Pet')
    })
  })

  describe('PetFormActions integration', () => {
    it('should pass correct props to PetFormActions', () => {
      render(<PetForm {...defaultProps} isLoading submitLabel="Update Pet" />)
      
      const formActions = screen.getByTestId('pet-form-actions')
      expect(formActions).toHaveTextContent('Submit Label: Update Pet')
      expect(formActions).toHaveTextContent('Loading: Yes')
      expect(formActions).toHaveTextContent('Show Cancel: Yes')
    })

    it('should handle cancel action', () => {
      const onCancel = vi.fn()
      render(<PetForm {...defaultProps} onCancel={onCancel} />)
      
      fireEvent.click(screen.getByText('Cancel'))
      expect(onCancel).toHaveBeenCalled()
    })

    it('should not show cancel button when onCancel is not provided', () => {
      render(<PetForm {...defaultProps} onCancel={undefined} />)
      
      const formActions = screen.getByTestId('pet-form-actions')
      expect(formActions).toHaveTextContent('Show Cancel: No')
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should show default submit label', () => {
      render(<PetForm {...defaultProps} />)
      
      const formActions = screen.getByTestId('pet-form-actions')
      expect(formActions).toHaveTextContent('Submit Label: Save Pet')
    })

    it('should show custom submit label', () => {
      render(<PetForm {...defaultProps} submitLabel="Create Pet" />)
      
      const formActions = screen.getByTestId('pet-form-actions')
      expect(formActions).toHaveTextContent('Submit Label: Create Pet')
    })
  })

  describe('form structure', () => {
    it('should render as a form element', () => {
      render(<PetForm {...defaultProps} />)
      
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      expect(form).toBeInTheDocument()
      expect(form).toHaveAttribute('component', 'form')
    })

    it('should have proper form styling', () => {
      render(<PetForm {...defaultProps} />)
      
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')!
      expect(form).toHaveStyle({
        maxWidth: '600px'
      })
    })

    it('should prevent default form submission', () => {
      const preventDefault = vi.fn()
      render(<PetForm {...defaultProps} />)
      
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')!
      fireEvent.submit(form, { preventDefault })
      
      expect(preventDefault).toHaveBeenCalled()
      expect(mockUsePetForm.handleSubmit).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should pass loading state to form actions', () => {
      render(<PetForm {...defaultProps} isLoading />)
      
      const formActions = screen.getByTestId('pet-form-actions')
      expect(formActions).toHaveTextContent('Loading: Yes')
    })

    it('should show not loading by default', () => {
      render(<PetForm {...defaultProps} />)
      
      const formActions = screen.getByTestId('pet-form-actions')
      expect(formActions).toHaveTextContent('Loading: No')
    })
  })

  describe('error handling', () => {
    it('should show error as alert', () => {
      render(<PetForm {...defaultProps} error="Upload failed" />)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Upload failed')
      expect(alert).toHaveClass('MuiAlert-standardError')
    })

    it('should pass picture errors to PetPictureUpload', () => {
      const errors = { profilePicture: 'Invalid file type' }
      Object.assign(mockUsePetForm, { errors })
      
      render(<PetForm {...defaultProps} />)
      
      const pictureUpload = screen.getByTestId('pet-picture-upload')
      expect(pictureUpload).toHaveTextContent('Error: Invalid file type')
    })

    it('should handle no picture error gracefully', () => {
      Object.assign(mockUsePetForm, { errors: {} })
      
      render(<PetForm {...defaultProps} />)
      
      const pictureUpload = screen.getByTestId('pet-picture-upload')
      expect(pictureUpload).toHaveTextContent('Error: No error')
    })
  })

  describe('initial data handling', () => {
    it('should pass initial data to hook', () => {
      const { usePetForm } = require('../../../hooks/usePetForm')
      const initialData = {
        name: 'Existing Pet',
        species: 'Cat',
        breed: 'Persian',
        birthDate: '2019-05-10',
        description: 'A beautiful cat'
      }
      
      render(<PetForm {...defaultProps} initialData={initialData} />)
      
      expect(usePetForm).toHaveBeenCalledWith({
        initialData,
        onSubmit: defaultProps.onSubmit
      })
    })

    it('should handle empty initial data', () => {
      const { usePetForm } = require('../../../hooks/usePetForm')
      
      render(<PetForm {...defaultProps} />)
      
      expect(usePetForm).toHaveBeenCalledWith({
        initialData: {},
        onSubmit: defaultProps.onSubmit
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<PetForm {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 5 })
      expect(heading).toHaveTextContent('Add New Pet')
    })

    it('should have centered heading', () => {
      render(<PetForm {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 5 })
      expect(heading).toHaveStyle({ textAlign: 'center' })
    })

    it('should have proper form landmark', () => {
      render(<PetForm {...defaultProps} />)
      
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('processedImageFile handling', () => {
    it('should handle processedImageFile from hook without errors', () => {
      // The component explicitly marks processedImageFile as unused
      // This test ensures it doesn't cause any issues
      Object.assign(mockUsePetForm, {
        processedImageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      })
      
      expect(() => {
        render(<PetForm {...defaultProps} />)
      }).not.toThrow()
    })

    it('should handle null processedImageFile', () => {
      Object.assign(mockUsePetForm, {
        processedImageFile: null
      })
      
      expect(() => {
        render(<PetForm {...defaultProps} />)
      }).not.toThrow()
    })
  })

  describe('integration scenarios', () => {
    it('should work as create pet form', () => {
      render(<PetForm {...defaultProps} submitLabel="Create Pet" />)
      
      expect(screen.getByText('Add New Pet')).toBeInTheDocument()
      expect(screen.getByText('Submit Label: Create Pet')).toBeInTheDocument()
      expect(screen.getByText('Show Cancel: Yes')).toBeInTheDocument()
    })

    it('should work as edit pet form', () => {
      const initialData = { name: 'Buddy', species: 'Dog' }
      
      render(
        <PetForm 
          {...defaultProps} 
          initialData={initialData}
          submitLabel="Update Pet"
          petId={123}
        />
      )
      
      expect(screen.getByText('Edit Pet Profile')).toBeInTheDocument()
      expect(screen.getByText('Submit Label: Update Pet')).toBeInTheDocument()
      expect(screen.getByText('Pet ID: 123')).toBeInTheDocument()
    })

    it('should work without cancel button', () => {
      render(<PetForm {...defaultProps} onCancel={undefined} />)
      
      expect(screen.getByText('Show Cancel: No')).toBeInTheDocument()
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should handle all hook interactions', () => {
      render(<PetForm {...defaultProps} />)
      
      // Test all hook function calls
      fireEvent.click(screen.getByText('Upload Picture'))
      fireEvent.click(screen.getByText('Upload Success'))
      fireEvent.click(screen.getByText('Picture Error'))
      fireEvent.click(screen.getByText('Remove Picture'))
      fireEvent.click(screen.getByText('Change Name'))
      
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')!
      fireEvent.submit(form)
      
      expect(mockUsePetForm.handlePictureUpload).toHaveBeenCalled()
      expect(mockUsePetForm.handlePictureUploadSuccess).toHaveBeenCalled()
      expect(mockUsePetForm.handlePictureError).toHaveBeenCalled()
      expect(mockUsePetForm.handleRemovePicture).toHaveBeenCalled()
      expect(mockUsePetForm.handleInputChange).toHaveBeenCalled()
      expect(mockUsePetForm.handleSubmit).toHaveBeenCalled()
    })
  })
}) 